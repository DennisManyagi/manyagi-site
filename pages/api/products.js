import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { division } = req.query;

  try {
    let query = supabaseAdmin.from('products').select('*').eq('status', 'active');
    if (division) query = query.eq('division', division);

    const { data: products, error } = await query;
    if (error) throw error;

    res.status(200).json(products || []);
  } catch (error) {
    console.error('Supabase products error:', error);
    // Fallback data
    const fallback = [
      { id: '1', name: 'Story T-shirt', price: 29.99, image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp', division: 'designs', description: 'Cool T-shirt', productType: 'merch' },
      { id: '2', name: 'Trading License', price: 99.99, image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/bot-license.webp', division: 'capital', description: '1-year license', productType: 'download' },
      { id: '3', name: 'Legacy eBook', price: 9.99, image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/legacy-chapter-1.webp', division: 'publishing', description: 'Chapter 1', productType: 'book' },
    ];
    res.status(200).json(fallback);
  }
}