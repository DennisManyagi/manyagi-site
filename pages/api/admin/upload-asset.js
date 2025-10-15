// pages/api/admin/upload-asset.js
// Uploads to Supabase Storage + inserts into assets + attaches tags
// Returns { file_url, asset_id, key, tags: [...], storage_key }
// Uses Bearer token from client (works locally + Netlify)

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const config = { api: { bodyParser: { sizeLimit: '50mb' } } }; // allow big MP4s

function clean(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '');
}

function normalizeTags(input) {
  // Accept: string "a,b,c" | string[] | null
  if (!input) return [];
  if (Array.isArray(input)) return input.map(t => clean(t)).filter(Boolean);
  if (typeof input === 'string') {
    return input.split(',').map(t => clean(t)).filter(Boolean);
  }
  return [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 1) Validate Bearer token
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized (no token)' });

    const { data: u, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !u?.user?.id) return res.status(401).json({ error: 'Unauthorized (invalid token)' });
    const userId = u.user.id;

    // 2) Check role in your public.users
    const { data: roleRow, error: roleErr } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    if (roleErr || roleRow?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    // 3) Parse inputs
    const { file, file_type, division, purpose, metadata, tags } = req.body || {};
    if (!file?.data || !file?.name) return res.status(400).json({ error: 'Missing file' });
    if (!file_type || !division || !purpose) {
      return res.status(400).json({ error: 'Missing file_type/division/purpose' });
    }

    const tagSlugs = normalizeTags(tags); // <= NEW
    const ext = String(file.name).split('.').pop().toLowerCase();
    const contentType =
      ext === 'png' ? 'image/png' :
      (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' :
      ext === 'webp' ? 'image/webp' :
      ext === 'mp4' ? 'video/mp4' :
      ext === 'pdf' ? 'application/pdf' :
      'application/octet-stream';

    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const storage_key = `${clean(division)}/${clean(purpose)}/${now}-${clean(file.name)}`;

    // 4) Upload to Storage
    const bin = Buffer.from(file.data, 'base64');
    const { error: uploadError } = await supabaseAdmin.storage
      .from('assets')
      .upload(storage_key, bin, { contentType, upsert: false });
    if (uploadError) throw uploadError;

    // 5) Public URL
    const { data: pub } = await supabaseAdmin.storage.from('assets').getPublicUrl(storage_key);
    const file_url = pub?.publicUrl;
    if (!file_url) throw new Error('Could not compute public URL');

    // 6) Normalize metadata + insert asset
    let meta = {};
    if (metadata) {
      if (typeof metadata === 'string') {
        try { meta = JSON.parse(metadata); } catch { meta = { raw: metadata }; }
      } else if (typeof metadata === 'object') {
        meta = metadata;
      }
    }

    // Include filename/uploader for better cataloging
    const filename = String(file.name);
    const { data: assetRow, error: dbError } = await supabaseAdmin
      .from('assets')
      .insert([{
        file_url,
        file_type,
        division,
        purpose,
        metadata: { ...meta, tags: tagSlugs },
        filename,
        storage_key,
        uploaded_by: userId,
      }])
      .select()
      .single();
    if (dbError) throw dbError;

    // 7) Tag upserts + linking (assets_tags)
    let linkedTags = [];
    if (tagSlugs.length) {
      // Upsert tags by slug
      const upsertRows = tagSlugs.map(slug => ({
        slug,
        label: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        kind: 'asset',
      }));
      const { data: tagRows, error: tagErr } = await supabaseAdmin
        .from('tags')
        .upsert(upsertRows, { onConflict: 'slug' })
        .select('id, slug');
      if (tagErr) throw tagErr;

      // Link to asset
      const linkRows = (tagRows || []).map(t => ({ asset_id: assetRow.id, tag_id: t.id }));
      const { error: linkErr } = await supabaseAdmin.from('assets_tags').insert(linkRows);
      if (linkErr) throw linkErr;
      linkedTags = (tagRows || []).map(t => t.slug);
    }

    // 8) Optional site_config hooks
    if (['hero', 'logo', 'favicon'].includes(purpose)) {
      await supabaseAdmin.from('site_config').upsert({
        key: purpose,
        value: { asset_id: assetRow.id, file_url },
      });
    } else if (purpose === 'carousel') {
      const { data: existing } = await supabaseAdmin
        .from('site_config').select('value').eq('key', 'carousel_images').maybeSingle();
      const arr = Array.isArray(existing?.value) ? existing.value : [];
      const updated = [...arr, file_url].slice(-5);
      await supabaseAdmin.from('site_config').upsert({ key: 'carousel_images', value: updated });
    }

    // 9) Done
    return res.status(200).json({
      file_url,
      asset_id: assetRow.id,
      key: storage_key,
      storage_key,
      tags: linkedTags,
    });
  } catch (error) {
    console.error('Asset upload error:', error);
    return res.status(500).json({ error: 'Failed to upload asset' });
  }
}
