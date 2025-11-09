// pages/api/admin/upload-asset-multi.js
// Fault-tolerant batch uploader with SAFE storage keys.
//
// Keeps original behavior, adds:
// - server-side filename sanitization (fixes "Invalid key")
// - honors client-sent contentType/fileType when present
// - still catches errors PER FILE and returns { ok, items, errors }

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { nanoid } from 'nanoid';

export const config = {
  api: {
    bodyParser: { sizeLimit: '50mb' },
  },
};

// --- Helpers ---------------------------------------------------------------

function guessContentType(ext) {
  switch ((ext || '').toLowerCase()) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png':  return 'image/png';
    case 'webp': return 'image/webp';
    case 'gif':  return 'image/gif';
    case 'svg':  return 'image/svg+xml';
    case 'heic':
    case 'heif': return 'image/heic';
    case 'pdf':  return 'application/pdf';
    case 'mp4':  return 'video/mp4';
    case 'mov':
    case 'm4v':  return 'video/quicktime';
    case 'webm': return 'video/webm';
    case 'mp3':  return 'audio/mpeg';
    case 'wav':  return 'audio/wav';
    default:     return 'application/octet-stream';
  }
}

function logicalTypeFromExt(ext) {
  const e = (ext || '').toLowerCase();
  if (['jpg','jpeg','png','webp','gif','svg','heic','heif'].includes(e)) return 'image';
  if (['mp4','mov','m4v','webm'].includes(e)) return 'video';
  if (['mp3','wav'].includes(e)) return 'audio';
  if (e === 'pdf') return 'pdf';
  return 'file';
}

// sanitize a single path segment for Supabase Storage keys
function sanitizeFilename(name) {
  const dot = name.lastIndexOf('.');
  const base = dot >= 0 ? name.slice(0, dot) : name;
  const ext  = dot >= 0 ? name.slice(dot).toLowerCase() : '';

  const safeBase = base
    .normalize('NFKD')
    // drop diacritics + punctuation not safe for keys
    .replace(/[^\w\s.-]/g, '')
    // spaces -> single dash
    .replace(/\s+/g, '-')
    // collapse multi-dashes
    .replace(/-+/g, '-')
    // trim leading/trailing dots/dashes
    .replace(/^[-.]+|[-.]+$/g, '');

  // keep keys reasonably short
  const trimmed = (safeBase || 'file').slice(0, 80);

  return `${trimmed}${ext || ''}`;
}

function logicalTypeFromClientOrExt(clientType, ext) {
  const allow = ['image','video','audio','pdf','file','other'];
  const t = (clientType || '').toLowerCase();
  if (allow.includes(t)) {
    // normalize "other" to "file" for DB
    return t === 'other' ? 'file' : t;
  }
  return logicalTypeFromExt(ext);
}

// --- Handler --------------------------------------------------------------

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1) Auth (admin only)
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(200).json({
        ok: false, items: [], errors: [{ name: '(all)', reason: 'Unauthorized (no token)' }],
      });
    }

    const { data: userResp, error: getUserErr } = await supabaseAdmin.auth.getUser(token);
    if (getUserErr || !userResp?.user) {
      return res.status(200).json({
        ok: false, items: [], errors: [{ name: '(all)', reason: 'Unauthorized (bad token)' }],
      });
    }

    const { data: roleRow, error: roleErr } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userResp.user.id)
      .maybeSingle();

    if (roleErr || (roleRow?.role || 'user') !== 'admin') {
      return res.status(200).json({
        ok: false, items: [], errors: [{ name: '(all)', reason: 'Forbidden (not admin)' }],
      });
    }

    // 2) Parse body
    const {
      files,
      division = 'site',
      purpose = 'general',
      folder = '',
      metadata = {},
    } = req.body || {};

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(200).json({
        ok: false, items: [], errors: [{ name: '(all)', reason: 'No files provided' }],
      });
    }

    // storage prefix: assets/<division>/<purpose>/YYYY/MM[/folder]
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');

    const basePrefix = [division, purpose, yyyy, mm, folder ? folder : null]
      .filter(Boolean)
      .join('/');

    const items = [];
    const errors = [];

    // 3) Process each file independently
    for (const f of files) {
      const clientName = f?.name || `upload-${nanoid(8)}`;
      const originalName = clientName; // for messages
      try {
        if (!f?.data) throw new Error('Missing base64 data');

        // base64 -> Buffer
        let buffer;
        try { buffer = Buffer.from(f.data, 'base64'); }
        catch { throw new Error('Invalid base64'); }

        // extension from (possibly unsanitized) input name
        const ext = (clientName.split('.').pop() || 'bin').toLowerCase();

        // choose file_type/contentType
        const fileType = logicalTypeFromClientOrExt(f?.fileType, ext);
        const contentType = f?.contentType || guessContentType(ext);

        // SERVER-SIDE SANITIZATION: never use raw clientName in key
        const safeName = sanitizeFilename(clientName);

        const storagePath = `${basePrefix}/${nanoid(6)}-${safeName}`;

        // 3a) upload to Supabase Storage (bucket: assets)
        const { error: upErr } = await supabaseAdmin.storage
          .from('assets')
          .upload(storagePath, buffer, {
            contentType,
            upsert: false,
          });

        if (upErr) {
          // propagate clean message (this is where "Invalid key" came from before)
          throw new Error(`Storage upload failed: ${upErr.message || 'unknown'}`);
        }

        // 3b) public URL
        const { data: pub } = await supabaseAdmin.storage
          .from('assets')
          .getPublicUrl(storagePath);
        const file_url = pub?.publicUrl;
        if (!file_url) throw new Error('Failed to generate public URL');

        // 3c) insert public.assets row
        const insertPayload = {
          file_url,
          file_type: fileType, // 'image' | 'video' | 'audio' | 'pdf' | 'file'
          division,
          purpose,
          filename: safeName,  // store the cleaned filename
          metadata,
        };

        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from('assets')
          .insert(insertPayload)
          .select('*')
          .single();

        if (insertErr) {
          throw new Error(`DB insert failed: ${insertErr.message}`);
        }

        items.push({
          id: inserted.id,
          file_url,
          filename: safeName,
          division,
          purpose,
        });
      } catch (err) {
        errors.push({ name: originalName, reason: String(err.message || err) });
      }
    }

    // 4) Respond
    return res.status(200).json({ ok: errors.length === 0, items, errors });
  } catch (fatal) {
    return res.status(200).json({
      ok: false,
      items: [],
      errors: [{ name: '(fatal)', reason: String(fatal?.message || fatal) }],
    });
  }
}
