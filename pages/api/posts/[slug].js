import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });
  try {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('id,title,slug,excerpt,created_at,featured_image,content,status')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(data);
  } catch (e) {
    console.error('post fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}
