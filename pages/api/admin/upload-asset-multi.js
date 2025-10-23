// pages/api/admin/upload-asset-multi.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { nanoid } from 'nanoid';

export const config = { api: { bodyParser: { sizeLimit: '25mb' } } }; // allow chunky uploads

const BUCKET = 'assets';

/**
 * Body:
 * {
 *   files: [{ data: base64WithoutPrefix, name: "photo.webp" }, ...],
 *   division: "realty" | "publishing" | "designs" | "site" ...,
 *   purpose: "general" | "hero" | "carousel",
 *   folder: "optional/extra/path",
 *   metadata: { ... } // optional metadata to save in assets table
 * }
 *
 * Returns: { ok: true, items: [{ file_url, path, name }] }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Added: Admin auth check
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data: userResp, error: getUserErr } = await supabaseAdmin.auth.getUser(token);
    if (getUserErr || !userResp?.user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: roleRow } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userResp.user.id)
      .maybeSingle();

    if ((roleRow?.role || 'user') !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { files, division = 'site', purpose = 'general', folder = '', metadata = {} } = req.body || {};
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');

    const basePrefix = `${division}/${purpose}/${yyyy}/${mm}${folder ? `/${folder}` : ''}`;

    const out = [];

    for (const f of files) {
      const name = f?.name || `upload-${nanoid(8)}`;
      // guess contentType from name
      const ext = name.split('.').pop()?.toLowerCase() || 'bin';
      const contentType =
        ext === 'webp' ? 'image/webp'
      : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'png' ? 'image/png'
      : ext === 'mp4' ? 'video/mp4'
      : ext === 'pdf' ? 'application/pdf'
      : 'application/octet-stream';

      const path = `${basePrefix}/${nanoid(6)}-${name}`;
      const buffer = Buffer.from(f.data, 'base64');

      const { error: upErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType, upsert: false });

      if (upErr) throw upErr;

      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
      const file_url = pub?.publicUrl;

      // OPTIONAL: record in your `assets` table for discoverability
      await supabaseAdmin.from('assets').insert({
        bucket: BUCKET,
        path,
        file_url,
        file_type: contentType.startsWith('image') ? 'image'
                 : contentType.startsWith('video') ? 'video'
                 : 'file',
        division,
        purpose,
        filename: name,
        metadata,
      });

      out.push({ file_url, path, name });
    }

    return res.status(200).json({ ok: true, items: out });
  } catch (e) {
    console.error('upload-asset-multi error', e);
    return res.status(500).json({ error: e.message || 'Upload failed' });
  }
}