// pages/api/admin/quick-create-product.js
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

async function fetchPrintfulPreview(variantId) {
  if (!variantId || !process.env.PRINTFUL_API_KEY) return { preview_url: null, product_id: null };
  try {
    const headers = { Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}` };
    const vRes = await fetch(`https://api.printful.com/store/variants/${variantId}`, { headers });
    if (!vRes.ok) throw new Error('Variant not found');
    const vJson = await vRes.json();
    const variant = vJson?.result;

    let preview_url =
      variant?.files?.find(f => f?.preview_url)?.preview_url ||
      variant?.thumbnail_url || null;

    const product_id = variant?.product_id ?? null;

    if (!preview_url && product_id) {
      const pRes = await fetch(`https://api.printful.com/store/products/${product_id}`, { headers });
      if (pRes.ok) {
        const pJson = await pRes.json();
        const sp = pJson?.result?.sync_product;
        const sv = pJson?.result?.sync_variants || [];
        preview_url =
          sp?.thumbnail_url ||
          (sv.find(x => (x?.files || []).some(f => f?.preview_url))?.files || []).find(f => f?.preview_url)?.preview_url ||
          null;
      }
    }
    return { preview_url, product_id };
  } catch (e) {
    return { preview_url: null, product_id: null };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      name,
      description = '',
      price,                 // number or numeric string
      currency = 'usd',
      image = '',            // optional thumbnail/mockup URL
      printfulVariantId = '',// optional: numeric/id as string
      divisions = ['designs'],
      status = 'active',
      tags = [],
      extraMetadata = {},
    } = req.body || {};

    if (!name) return res.status(400).json({ error: 'Name is required' });
    const amount = Number(price);
    if (!(amount > 0)) return res.status(400).json({ error: 'Valid price required' });

    // If no image provided but we have a variant, try to fetch a mockup URL
    let thumbnail_url = image || null;
    let printful_product_id = null;

    if (!thumbnail_url && printfulVariantId) {
      const { preview_url, product_id } = await fetchPrintfulPreview(printfulVariantId);
      thumbnail_url = preview_url || null;
      printful_product_id = product_id ? String(product_id) : null;
    }

    // 1) Stripe objects
    const sProduct = await stripe.products.create({
      name,
      description,
      images: thumbnail_url ? [thumbnail_url] : undefined,
      default_price_data: {
        currency,
        unit_amount: Math.round(amount * 100),
      },
      metadata: {
        brand: 'Manyagi',
        ...extraMetadata,
      },
    });

    // default_price_data returns price in product’s default_price
    const sPriceId =
      typeof sProduct.default_price === 'string'
        ? sProduct.default_price
        : sProduct.default_price?.id;

    // 2) Create Supabase products for each division
    const rows = divisions.map((division) => ({
      name,
      division,
      price: amount,
      description,
      status,
      thumbnail_url: thumbnail_url || null,
      printful_product_id: printful_product_id, // may be null if not fetched
      tags,
      metadata: {
        stripe_product_id: sProduct.id,
        stripe_price_id: sPriceId,
        printful_sync_variant_id: printfulVariantId || null,
        extra: extraMetadata || {},
      },
    }));

    const { error: insErr } = await supabaseAdmin.from('products').insert(rows);
    if (insErr) throw insErr;

    return res.status(200).json({
      ok: true,
      stripe_product_id: sProduct.id,
      stripe_price_id: sPriceId,
      used_thumbnail_url: thumbnail_url || null,
      printful_product_id: printful_product_id,
      divisions_created: divisions,
    });
  } catch (err) {
    console.error('quick-create-product error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
