// pages/api/products.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function coerceMetadata(meta) {
  if (!meta) return {};
  if (typeof meta === 'object') return meta;
  if (typeof meta === 'string') {
    try {
      return JSON.parse(meta);
    } catch {
      return {};
    }
  }
  return {};
}

function coerceTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    // try JSON first
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // CSV fallback
      return tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    // IMPORTANT: include nft_url in the selection!
    let query = supabaseAdmin
      .from('products')
      .select(
        `
        id, name, description, price, division, status,
        image_url, thumbnail_url, printful_product_id,
        metadata, tags, nft_url,
        created_at
      `,
        { count: 'exact' }
      )
      .eq('status', 'active');

    if (division) query = query.eq('division', division);

    if (q) {
      // Search across name, description, and metadata fields
      query = query.or(
        [
          `name.ilike.%${q}%`,
          `description.ilike.%${q}%`,
          `metadata->>scene.ilike.%${q}%`,
          `metadata->>book.ilike.%${q}%`,
        ].join(',')
      );
    }

    if (tag) {
      // products.tags is text[]; Supabase contains() works with arrays
      query = query.contains('tags', [tag]);
    }

    if (collection) {
      // support "prompt-1" or "2025" or direct book/series/drop strings
      if (/^prompt-\d+$/i.test(collection)) {
        const p = collection.split('-')[1];
        query = query.eq('metadata->>prompt', String(Number(p)));
      } else if (/^\d{4}$/.test(collection)) {
        query = query.eq('metadata->>year', collection);
      } else {
        // try book or series or drop match
        query = query.or(
          [
            `metadata->>book.eq.${collection}`,
            `metadata->>series.eq.${collection}`,
            `metadata->>drop.eq.${collection}`,
          ].join(',')
        );
      }
    }

    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true, nullsFirst: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const lim = Math.max(1, Math.min(100, Number(limit) || 16));
    const off = Math.max(0, Number(offset) || 0);
    query = query.range(off, off + lim - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const items = (data || []).map((row) => {
      const metadata = coerceMetadata(row.metadata);
      const tags = coerceTags(row.tags);

      // Prefer top-level nft_url; then metadata.nft_url; support legacy nftUrl as well
      const nft_url =
        row.nft_url ||
        metadata.nft_url ||
        row.nftUrl ||
        metadata.nftUrl ||
        null;

      return {
        id: row.id,
        name: row.name,
        description: row.description || '',
        division: row.division,
        status: row.status,
        price: Number(row.price),
        image_url: row.image_url || '',
        thumbnail_url: row.thumbnail_url || '',
        display_image: row.thumbnail_url || row.image_url || '',
        printful_product_id: row.printful_product_id || '',
        tags,
        metadata,
        // expose nft_url so Card can show the ribbon & button
        nft_url,
        // convenience fields that your UI already uses
        prompt: metadata?.prompt,
        book: metadata?.book,
        scene: metadata?.scene,
        productType:
          row.division === 'designs'
            ? 'merch'
            : row.division === 'publishing'
            ? 'book'
            : row.division === 'capital'
            ? 'download'
            : 'general',
        created_at: row.created_at,
      };
    });

    res.status(200).json({ items, total: count ?? items.length });
  } catch (error) {
    console.error('Supabase products error:', error);

    const fallback =
      division === 'designs'
        ? [
            {
              id: 'fallback-tee',
              name: 'Sample T-Shirt',
              price: 29.99,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp',
              thumbnail_url:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp',
              image_url:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp',
              division: 'designs',
              description: 'Fallback design merchandise',
              printful_product_id: 'fallback-tee-id',
              productType: 'merch',
              metadata: { prompt: 1, book: 'Sample', scene: 'Portal' },
              tags: ['sample', 'tee'],
              nft_url: null,
            },
          ]
        : [];

    res.status(200).json({ items: fallback, total: fallback.length });
  }
}
