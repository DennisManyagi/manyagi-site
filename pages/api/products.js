import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { division } = req.query;

  try {
    let query = supabaseAdmin
      .from('products')
      .select(`
        id, name, description, price, division, status,
        image_url, thumbnail_url, printful_product_id,
        metadata,
        created_at
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (division) {
      query = query.eq('division', division);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    const transformed = (products || []).map(product => ({
      ...product,
      display_image: product.thumbnail_url || product.image_url,
      price: Number(product.price),
      prompt: product.metadata?.prompt,
      book: product.metadata?.book,
      scene: product.metadata?.scene,
      productType: product.productType || 
        (product.division === 'designs' ? 'merch' : 
         product.division === 'publishing' ? 'book' : 
         product.division === 'capital' ? 'download' : 'general'),
    }));

    res.status(200).json(transformed);
  } catch (error) {
    console.error('Supabase products error:', error);
    
    const fallback = division === 'designs' ? [
      { 
        id: 'fallback-tee', 
        name: 'Sample T-Shirt', 
        price: 29.99, 
        display_image: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp',
        thumbnail_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp',
        image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp',
        division: 'designs', 
        description: 'Fallback design merchandise',
        printful_product_id: 'fallback-tee-id',
        productType: 'merch',
        metadata: { prompt: 0, book: 'Sample' }
      },
    ] : [];

    res.status(200).json(fallback);
  }
}