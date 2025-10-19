// pages/api/checkout/create-session.js
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      product_id,          // required
      quantity = 1,
      user_id = null,
      success_url,
      cancel_url
    } = req.body || {};

    if (!product_id) return res.status(400).json({ error: 'product_id is required' });
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // Load product
    const { data: product, error: pErr } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', product_id)
      .maybeSingle();

    if (pErr) throw pErr;
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const meta = product.metadata || {};
    const stripePriceId = meta.stripe_price_id;

    if (!stripePriceId) {
      return res.status(400).json({ error: 'Missing metadata.stripe_price_id on this product' });
    }

    // Do we need a shipping address (for Printful)?
    const needsShipping =
      !!meta.printful_sync_variant_id ||
      meta.fulfill_with_printful === true ||
      product.division === 'designs';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: stripePriceId, quantity: qty }],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      // Collect shipping only if needed (keeps ebooks & Amazon-only clean)
      shipping_address_collection: needsShipping ? { allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE'] } : undefined,
      phone_number_collection: needsShipping ? { enabled: true } : undefined,
      success_url: success_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/cancelled`,
      metadata: {
        product_id: String(product.id),
        division: String(product.division || 'site'),
      },
    });

    // Pending order for webhook to finalize
    const estimatedTotal = Number(product.price || 0) * qty;
    await supabaseAdmin.from('orders').insert({
      user_id,
      product_id: product.id,
      division: product.division || 'site',
      status: 'pending',
      total_amount: estimatedTotal,
      stripe_session_id: session.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true, id: session.id, url: session.url });
  } catch (err) {
    console.error('create-session error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
