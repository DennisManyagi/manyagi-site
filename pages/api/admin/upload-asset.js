import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Auth check (pages/api helper)
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      console.error('Supabase auth error:', authErr);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: userData, error: roleErr } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (roleErr) {
      console.error('Role check error:', roleErr);
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (userData?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { file, file_type, division, purpose, metadata } = req.body;
    if (!file || !file.data) {
      return res.status(400).json({ error: 'Missing file' });
    }

    const fileName = `${Date.now()}-${file.name || 'file'}`;
    const filePath = path.join(process.cwd(), 'public', 'temp', fileName);
    // Example temp handling kept here if you later want to persist locally:
    // await fs.writeFile(filePath, Buffer.from(file.data, 'base64'));

    // Upload to Supabase Storage (server-side service role is OK here)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('assets')
      .upload(fileName, Buffer.from(file.data, 'base64')); // Assuming base64 payload

    if (uploadError) throw uploadError;

    const file_url = `https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/${fileName}`;

    // Save to DB
    const { data: assetData, error: dbError } = await supabaseAdmin.from('assets')
      .insert({
        file_url,
        file_type,
        division,
        purpose,
        metadata: metadata ? JSON.parse(metadata) : {},
      })
      .select()
      .single();
    if (dbError) throw dbError;

    // Update site_config for special keys
    if (['hero', 'logo', 'favicon'].includes(purpose)) {
      await supabaseAdmin.from('site_config').upsert({
        key: purpose,
        value: { asset_id: assetData.id, file_url },
      });
    } else if (purpose === 'carousel') {
      const { data: existingConfig } = await supabaseAdmin
        .from('site_config')
        .select('value')
        .eq('key', 'carousel_images')
        .single();
      const currentImages = existingConfig?.value || [];
      const updatedImages = [...currentImages, file_url].slice(-5);
      await supabaseAdmin.from('site_config').upsert({
        key: 'carousel_images',
        value: updatedImages,
      });
    }

    // Cleanup example:
    // await fs.unlink(filePath);

    return res.status(200).json({ file_url, asset_id: assetData.id });
  } catch (error) {
    console.error('Asset upload error:', error);
    return res.status(500).json({ error: 'Failed to upload asset' });
  }
}
