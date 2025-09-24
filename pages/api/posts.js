import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(_req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('id,title,slug,excerpt,created_at,featured_image,content,status')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(data || []);
  } catch (e) {
    console.error('posts list error:', e);
    res.status(200).json([]);
  }
}
