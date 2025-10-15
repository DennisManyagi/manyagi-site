// pages/api/products.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const {
    division = '',
    collection = '', // maps to metadata fields like book/series/drop/year/prompt
    tag = '',        // matches any item in products.tags text[]
    q = '',          // search in name/description/metadata.scene/book
    sort = 'new',    // 'new' | 'price_asc' | 'price_desc'
    limit = '16',
    offset = '0',
  } = req.query;

  try {
    let query = supabaseAdmin
      .from('products')
      .select(`
        id, name, description, price, division, status,
        image_url, thumbnail_url, printful_product_id,
        metadata, tags,
        created_at
      `, { count: 'exact' })
      .eq('status', 'active');

    if (division) query = query.eq('division', division);

    // text search
    if (q) {
      // basic strategy: filter on name/description; metadata JSONB -> search by scene/book
      query = query.or([
        `name.ilike.%${q}%`,
        `description.ilike.%${q}%`,
        `metadata->>scene.ilike.%${q}%`,
        `metadata->>book.ilike.%${q}%`,
      ].join(','));
    }

    // tag filter (products.tags is text[])
    if (tag) query = query.contains('tags', [tag]);

    // collection filter (book/series/drop/year/prompt)
    if (collection) {
      // support "prompt-1" or "2025" or direct book/series string
      if (/^prompt-\d+$/i.test(collection)) {
        const p = collection.split('-')[1];
        query = query.eq('metadata->>prompt', String(Number(p)));
      } else if (/^\d{4}$/.test(collection)) {
        query = query.eq('metadata->>year', collection);
      } else {
        // try book or series or drop match
        query = query.or([
          `metadata->>book.eq.${collection}`,
          `metadata->>series.eq.${collection}`,
          `metadata->>drop.eq.${collection}`,
        ].join(','));
      }
    }

    // sort
    if (sort === 'price_asc') query = query.order('price', { ascending: true, nullsFirst: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false, nullsFirst: false });
    else query = query.order('created_at', { ascending: false });

    // pagination
    const lim = Math.max(1, Math.min(100, Number(limit) || 16));
    const off = Math.max(0, Number(offset) || 0);
    query = query.range(off, off + lim - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // shape + safe numbers
    const items = (data || []).map(product => ({
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
      tags: Array.isArray(product.tags) ? product.tags : [],
    }));

    res.status(200).json({ items, total: count ?? items.length });
  } catch (error) {
    console.error('Supabase products error:', error);

    // simple fallback (keeps page usable)
    const fallback = division === 'designs' ? [{
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
      metadata: { prompt: 1, book: 'Sample', scene: 'Portal' },
      tags: ['sample', 'tee'],
    }] : [];

    res.status(200).json({ items: fallback, total: fallback.length });
  }
}
