// pages/api/admin/upload-asset-multi.js
// Fault-tolerant batch uploader.
//
// What it does now:
// - Auth check (must be 'admin' in public.users)
// - For each file:
//    - convert base64 -> Buffer
//    - upload to Supabase Storage bucket 'assets'
//    - generate public URL
//    - insert a row in public.assets
// - We catch errors PER FILE so one bad file doesn't kill the others.
// - We always respond 200 with { ok, items, errors } so frontend can summarize.
//
// This fixes the "2nd file throws 500 and stops everything" problem you saw.

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { nanoid } from 'nanoid';

export const config = {
  api: {
    bodyParser: { sizeLimit: '50mb' }, // allow large batches of photos/videos
  },
};

// Map extension -> Content-Type header for storage
function guessContentType(ext) {
  switch ((ext || '').toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'heic':
    case 'heif':
      return 'image/heic';
    case 'pdf':
      return 'application/pdf';
    case 'mp4':
      return 'video/mp4';
    case 'mov':
    case 'm4v':
      return 'video/quicktime';
    case 'webm':
      return 'video/webm';
    default:
      return 'application/octet-stream';
  }
}

// Decide what we store in assets.file_type
function logicalTypeFromExt(ext) {
  const e = (ext || '').toLowerCase();
  if (
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'heic', 'heif'].includes(e)
  ) {
    return 'image';
  }
  if (['mp4', 'mov', 'm4v', 'webm'].includes(e)) {
    return 'video';
  }
  if (e === 'pdf') {
    return 'pdf';
  }
  return 'file';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ---------- 1) Auth check ----------
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(200).json({
        ok: false,
        items: [],
        errors: [{ name: '(all)', reason: 'Unauthorized (no token)' }],
      });
    }

    const { data: userResp, error: getUserErr } = await supabaseAdmin.auth.getUser(token);
    if (getUserErr || !userResp?.user) {
      return res.status(200).json({
        ok: false,
        items: [],
        errors: [{ name: '(all)', reason: 'Unauthorized (bad token)' }],
      });
    }

    const userId = userResp.user.id;

    // role check in public.users
    const { data: roleRow, error: roleErr } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (roleErr || (roleRow?.role || 'user') !== 'admin') {
      return res.status(200).json({
        ok: false,
        items: [],
        errors: [{ name: '(all)', reason: 'Forbidden (not admin)' }],
      });
    }

    // ---------- 2) Parse and prep ----------
    const {
      files,
      division = 'site',
      purpose = 'general',
      folder = '',
      metadata = {},
    } = req.body || {};

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(200).json({
        ok: false,
        items: [],
        errors: [{ name: '(all)', reason: 'No files provided' }],
      });
    }

    // We'll store uploads like:
    // assets bucket / division / purpose / YYYY / MM / [folder?] / <random>-<filename>
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');

    const basePrefix = [division, purpose, yyyy, mm, folder ? folder : null]
      .filter(Boolean)
      .join('/');

    const items = [];
    const errors = [];

    // ---------- 3) Process each file independently ----------
    for (const f of files) {
      const originalName = f?.name || `upload-${nanoid(8)}`;
      try {
        if (!f?.data) {
          throw new Error('Missing base64 data');
        }

        let buffer;
        try {
          buffer = Buffer.from(f.data, 'base64');
        } catch {
          throw new Error('Invalid base64');
        }

        const ext = (originalName.split('.').pop() || 'bin').toLowerCase();
        const contentType = guessContentType(ext);
        const logicalType = logicalTypeFromExt(ext);

        const storagePath = `${basePrefix}/${nanoid(6)}-${originalName}`;

        // 3a. upload to Supabase Storage
        const { error: upErr } = await supabaseAdmin.storage
          .from('assets')
          .upload(storagePath, buffer, {
            contentType,
            upsert: false,
          });

        if (upErr) {
          throw new Error(
            `Storage upload failed: ${upErr.message || 'unknown'}`
          );
        }

        // 3b. get public URL
        const { data: pub } = await supabaseAdmin.storage
          .from('assets')
          .getPublicUrl(storagePath);
        const file_url = pub?.publicUrl;
        if (!file_url) {
          throw new Error('Failed to generate public URL');
        }

        // 3c. insert DB row in public.assets
        const insertPayload = {
          file_url,
          file_type: logicalType, // 'image' | 'video' | 'pdf' | 'file'
          division,
          purpose,
          filename: originalName,
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

        // 3d. push success record
        items.push({
          id: inserted.id,
          file_url,
          filename: originalName,
          division,
          purpose,
        });
      } catch (err) {
        // push error record for this file, but continue loop for others
        errors.push({
          name: originalName,
          reason: String(err.message || err),
        });
      }
    }

    // ---------- 4) Respond with successes + failures ----------
    return res.status(200).json({
      ok: errors.length === 0,
      items,
      errors,
    });
  } catch (fatal) {
    // truly unexpected crash outside the loop
    return res.status(200).json({
      ok: false,
      items: [],
      errors: [
        { name: '(fatal)', reason: String(fatal?.message || fatal) },
      ],
    });
  }
}
