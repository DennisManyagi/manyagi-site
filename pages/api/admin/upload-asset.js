import { createServerClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase';
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Auth check
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { data: userData } = await supabaseAdmin.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { file, file_type, division, purpose, metadata } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'Missing file' });
    }

    // For server-side upload, you'd handle file upload differently
    // This is a placeholder - in practice, use multer or similar for file uploads
    const fileName = `${Date.now()}-${file.name || 'file'}`;
    const filePath = path.join(process.cwd(), 'public', 'temp', fileName);
    
    // Simulate file save (in production, save to temp dir then upload)
    // await fs.writeFile(filePath, file.data);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('assets')
      .upload(fileName, Buffer.from(file.data, 'base64')); // Assuming base64 data
    
    if (uploadError) throw uploadError;

    const file_url = `https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/${fileName}`;

    // Save to assets table
    const { data: assetData, error: dbError } = await supabaseAdmin.from('assets').insert({
      file_url,
      file_type,
      division,
      purpose,
      metadata: metadata ? JSON.parse(metadata) : {},
    }).select().single();
    
    if (dbError) throw dbError;

    // Update site_config for special purposes
    if (['hero', 'logo', 'favicon'].includes(purpose)) {
      await supabaseAdmin.from('site_config').upsert({
        key: purpose,
        value: { asset_id: assetData.id, file_url },
      });
    } else if (purpose === 'carousel') {
      const { data: existingConfig } = await supabaseAdmin.from('site_config').select('value').eq('key', 'carousel_images').single();
      const currentImages = existingConfig?.value || [];
      const updatedImages = [...currentImages, file_url].slice(-5);
      await supabaseAdmin.from('site_config').upsert({
        key: 'carousel_images',
        value: updatedImages,
      });
    }

    // Clean up temp file
    // await fs.unlink(filePath);

    res.status(200).json({ file_url, asset_id: assetData.id });
  } catch (error) {
    console.error('Asset upload error:', error);
    res.status(500).json({ error: 'Failed to upload asset' });
  }
}