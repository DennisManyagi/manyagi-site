// pages/api/admin/upload-asset.js
// Upload to Supabase Storage, insert into public.assets, and (optionally) upsert/link tags.
// Works with your existing supabaseAdmin helper (service role).
// Accepts file.data as either raw base64 *or* a data URL.
// Returns the inserted asset row, plus convenience fields.

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const config = { api: { bodyParser: { sizeLimit: '50mb' } } }; // allow big images/mp4

// ---------- helpers ----------
const clean = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '');

const normalizeTags = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(clean).filter(Boolean);
  if (typeof input === 'string') return input.split(',').map(clean).filter(Boolean);
  return [];
};

const guessMime = (name, fallbackType) => {
  const ext = (String(name || '').split('.').pop() || '').toLowerCase();
  if (['jpg', 'jpeg'].includes(ext)) return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'mp4') return 'video/mp4';
  if (ext === 'pdf') return 'application/pdf';
  // fall back to declared file_type if helpful
  if (fallbackType === 'image') return 'application/octet-stream'; // storage will still host
  if (fallbackType === 'video') return 'video/mp4';
  if (fallbackType === 'pdf') return 'application/pdf';
  return 'application/octet-stream';
};

const toBuffer = (maybeBase64) => {
  // Accept plain base64 or full data URL
  if (!maybeBase64) return null;
  const base64 =
    typeof maybeBase64 === 'string'
      ? (maybeBase64.includes('base64,') ? maybeBase64.split('base64,').pop() : maybeBase64)
      : '';
  try {
    return Buffer.from(base64, 'base64');
  } catch {
    return null;
  }
};

// ---------- SAFE column detector (no pg_catalog / information_schema) ----------
/**
 * We infer column names by selecting a single row from the table
 * and taking Object.keys(row). If the table is empty, we fall back
 * to an empty array. Result is cached per table for this lambda run.
 */
const columnsCache = {};
async function tableColumns(table) {
  if (columnsCache[table]) return columnsCache[table];

  try {
    const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
    if (error || !data || !data.length) {
      columnsCache[table] = [];
      return [];
    }
    const cols = Object.keys(data[0] || {});
    columnsCache[table] = cols;
    return cols;
  } catch (e) {
    console.warn(`[tableColumns] Failed to inspect table "${table}":`, e?.message || e);
    columnsCache[table] = [];
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // ---------- 1) Auth: Bearer token + admin role ----------
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized (missing token)' });

    const { data: userResult, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userResult?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized (invalid token)' });
    }
    const userId = userResult.user.id;

    const { data: roleRow, error: roleErr } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    if (roleErr || roleRow?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // ---------- 2) Parse inputs ----------
    const { file, file_type, division, purpose, metadata, tags } = req.body || {};
    if (!file?.data || !file?.name) {
      return res.status(400).json({ error: 'Missing file {data,name}' });
    }
    if (!file_type || !division || !purpose) {
      return res.status(400).json({ error: 'Missing file_type/division/purpose' });
    }

    const tagSlugs = normalizeTags(tags);
    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const storage_key = `${clean(division)}/${clean(purpose)}/${now}-${clean(file.name)}`;
    const contentType = guessMime(file.name, file_type);

    // ---------- 3) Upload to Storage (handle duplicate path safely) ----------
    const bin = toBuffer(file.data);
    if (!bin) {
      return res.status(400).json({ error: 'Invalid base64 payload' });
    }

    let finalKey = storage_key;
    let upErr = null;

    const doUpload = async (key) => {
      const { error } = await supabaseAdmin.storage
        .from('assets')
        .upload(key, bin, { contentType, upsert: false });
      return error;
    };

    upErr = await doUpload(finalKey);
    if (upErr && String(upErr.message || '').toLowerCase().includes('duplicate')) {
      finalKey = `${clean(division)}/${clean(purpose)}/${now}-${Date.now()}-${clean(file.name)}`;
      upErr = await doUpload(finalKey);
    }
    if (upErr) {
      console.error('[upload error]', upErr);
      return res
        .status(500)
        .json({ error: `Storage upload failed: ${upErr.message || 'unknown'}` });
    }

    const { data: pub } = await supabaseAdmin.storage.from('assets').getPublicUrl(finalKey);
    const file_url = pub?.publicUrl;
    if (!file_url) {
      return res.status(500).json({ error: 'Failed to compute public URL' });
    }

    // ---------- 4) Normalize metadata ----------
    let meta = {};
    if (metadata) {
      if (typeof metadata === 'string') {
        try {
          meta = JSON.parse(metadata);
        } catch {
          meta = { raw: metadata };
        }
      } else if (typeof metadata === 'object') {
        meta = metadata;
      }
    }

    // ---------- 5) Insert into public.assets (supports assets.tags if present) ----------
    const cols = await tableColumns('assets').catch(() => []);
    const hasTagsColumn = cols.includes('tags'); // text[]
    const hasFilename = cols.includes('filename');
    const hasStorageKey = cols.includes('storage_key');
    const hasUploadedBy = cols.includes('uploaded_by');

    const insertPayload = {
      file_url,
      file_type,
      division,
      purpose,
      metadata: {
        ...meta,
        // ensure tags are always mirrored inside metadata
        tags: Array.isArray(meta?.tags) && meta.tags.length ? meta.tags : tagSlugs,
      },
    };

    if (hasTagsColumn) insertPayload.tags = tagSlugs;
    if (hasFilename) insertPayload.filename = String(file.name);
    if (hasStorageKey) insertPayload.storage_key = finalKey;
    if (hasUploadedBy) insertPayload.uploaded_by = userId;

    let inserted = null;
    {
      const { data, error } = await supabaseAdmin
        .from('assets')
        .insert(insertPayload)
        .select('*')
        .single();
      if (error) {
        console.error('[insert assets error]', error);
        return res.status(500).json({ error: `DB insert failed: ${error.message}` });
      }
      inserted = data;
    }

    // ---------- 6) Optional tags upsert & linking (assets_tags) ----------
    // If you created public.tags + public.assets_tags, we populate them; otherwise we silently skip.
    try {
      if (tagSlugs.length) {
        // upsert tags
        const upsertRows = tagSlugs.map((slug) => ({
          slug,
          label: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          kind: 'asset',
        }));
        const { data: tagRows } = await supabaseAdmin
          .from('tags')
          .upsert(upsertRows, { onConflict: 'slug' })
          .select('id, slug');

        if (Array.isArray(tagRows) && tagRows.length) {
          const linkRows = tagRows.map((t) => ({ asset_id: inserted.id, tag_id: t.id }));
          await supabaseAdmin.from('assets_tags').insert(linkRows);
        }
      }
    } catch (e) {
      // tables might not exist; ignore silently
      console.warn('[tags upsert/link skipped]', e?.message || e);
    }

    // ---------- 7) Optional site_config hooks ----------
    try {
      if (['hero', 'logo', 'favicon'].includes(purpose)) {
        await supabaseAdmin
          .from('site_config')
          .upsert(
            { key: purpose, value: { asset_id: inserted.id, file_url } },
            { onConflict: 'key' }
          );
      } else if (purpose === 'carousel') {
        const { data: existing } = await supabaseAdmin
          .from('site_config')
          .select('value')
          .eq('key', 'carousel_images')
          .maybeSingle();
        const arr = Array.isArray(existing?.value) ? existing.value : [];
        const updated = [...arr, file_url].slice(-5);
        await supabaseAdmin
          .from('site_config')
          .upsert({ key: 'carousel_images', value: updated }, { onConflict: 'key' });
      }
    } catch (e) {
      console.warn('[site_config hook skipped]', e?.message || e);
    }

    // ---------- 8) Done ----------
    return res.status(200).json({
      ...inserted,
      file_url,
      storage_key: finalKey,
      tags: tagSlugs,
    });
  } catch (error) {
    console.error('Asset upload fatal:', error);
    return res
      .status(500)
      .json({ error: error?.message || 'Failed to upload asset' });
  }
}
