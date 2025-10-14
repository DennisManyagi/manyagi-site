// pages/api/admin/upload-asset.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const config = { api: { bodyParser: { sizeLimit: '25mb' } } }; // for mp4

function clean(s) {
  return String(s || '').trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 1) Auth & admin check
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: userData, error: roleErr } = await supabaseAdmin
      .from('users').select('role').eq('id', user.id).single();
    if (roleErr || userData?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    // 2) Input
    const { file, file_type, division, purpose, metadata } = req.body || {};
    if (!file?.data || !file?.name) return res.status(400).json({ error: 'Missing file' });
    if (!file_type || !division || !purpose) return res.status(400).json({ error: 'Missing file_type/division/purpose' });

    // 3) Content type + storage key
    const ext = file.name.split('.').pop().toLowerCase();
    const contentType =
      ext === 'png' ? 'image/png' :
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      ext === 'webp' ? 'image/webp' :
      ext === 'mp4' ? 'video/mp4' :
      ext === 'pdf' ? 'application/pdf' :
      'application/octet-stream';

    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `${clean(division)}/${clean(purpose)}/${now}-${clean(file.name)}`;

    // 4) Upload
    const bin = Buffer.from(file.data, 'base64');
    const { error: uploadError } = await supabaseAdmin.storage.from('assets').upload(key, bin, {
      contentType,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    // 5) Public URL (no hardcoding)
    const { data: pub } = await supabaseAdmin.storage.from('assets').getPublicUrl(key);
    const file_url = pub?.publicUrl;
    if (!file_url) throw new Error('Could not compute public URL');

    // 6) Metadata normalize
    let meta = {};
    if (metadata) {
      if (typeof metadata === 'string') { try { meta = JSON.parse(metadata); } catch { meta = { raw: metadata }; } }
      else if (typeof metadata === 'object') { meta = metadata; }
    }

    // 7) Insert into public.assets (your schema uses file_url)
    const { data: assetData, error: dbError } = await supabaseAdmin
      .from('assets')
      .insert([{ file_url, file_type, division, purpose, metadata: meta }])
      .select()
      .single();
    if (dbError) throw dbError;

    // 8) Optional site_config updates (kept from your version)
    if (['hero', 'logo', 'favicon'].includes(purpose)) {
      await supabaseAdmin.from('site_config').upsert({
        key: purpose, value: { asset_id: assetData.id, file_url },
      });
    } else if (purpose === 'carousel') {
      const { data: existing } = await supabaseAdmin
        .from('site_config').select('value').eq('key', 'carousel_images').maybeSingle();
      const arr = Array.isArray(existing?.value) ? existing.value : [];
      const updated = [...arr, file_url].slice(-5);
      await supabaseAdmin.from('site_config').upsert({ key: 'carousel_images', value: updated });
    }

    return res.status(200).json({ file_url, asset_id: assetData.id, key });
  } catch (error) {
    console.error('Asset upload error:', error);
    return res.status(500).json({ error: 'Failed to upload asset' });
  }
}
