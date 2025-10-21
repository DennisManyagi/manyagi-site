// pages/api/checkout/create-session.js
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      // Shared
      success_url,
      cancel_url,
      // SUBSCRIPTION path
      mode,                 // 'subscription' => create subscription checkout
      price_id,             // optional override; falls back to env
      email,                // optional prefill for subscription
      telegramId,           // from Signals form
      // ONE-TIME path
      product_id,           // required for one-time purchase
      quantity = 1,
      user_id = null,
    } = req.body || {};

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // -------------------------
    // 1) SUBSCRIPTION CHECKOUT
    // -------------------------
    if (mode === 'subscription') {
      const activePrice = price_id || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
      if (!activePrice) {
        return res.status(400).json({ error: 'Missing price_id. Set NEXT_PUBLIC_STRIPE_PRICE_ID or pass price_id in body.' });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: activePrice, quantity: 1 }],
        allow_promotion_codes: true,
        customer_email: email || undefined,
        success_url: success_url || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancel_url || `${baseUrl}/checkout/cancelled`,
        customer_creation: 'always', // ensures we have a Customer to store metadata on
        // put telegramId everywhere we might read it later
        metadata: {
          telegramId: telegramId ? String(telegramId) : '',
          plan: 'Basic Signals',
          division: 'capital',
        },
        subscription_data: {
          metadata: {
            telegramId: telegramId ? String(telegramId) : '',
            plan: 'Basic Signals',
            division: 'capital',
          },
        },
      });

      return res.status(200).json({ ok: true, id: session.id, url: session.url });
    }

    // --------------------------------
    // 2) ONE-TIME (PRODUCT) CHECKOUT
    // --------------------------------
    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required for one-time checkout (or set mode: "subscription")' });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // Load product from Supabase
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

    // Decide if we must collect shipping (for merch/physical items)
    const needsShipping =
      !!meta.printful_sync_variant_id ||
      meta.fulfill_with_printful === true;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: stripePriceId, quantity: qty }],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      shipping_address_collection: needsShipping
        ? { allowed_countries: ['US','CA','GB','AU','NZ','DE','FR','ES','IT','NL','SE'] }
        : undefined,
      phone_number_collection: needsShipping ? { enabled: true } : undefined,
      success_url: success_url || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${baseUrl}/checkout/cancelled`,
      metadata: {
        product_id: String(product.id),
        division: String(product.division || 'site'),
        quantity: String(qty),
        product_name: String(product.name || ''),
      },
    });

    // Record a pending order for your webhook to finalize
    const estimatedTotal = Number(product.price || 0) * qty;
    await supabaseAdmin.from('orders').insert({
      user_id,
      product_id: product.id,
      division: product.division || 'site',
      status: 'pending',
      quantity: qty,
      total_amount: estimatedTotal,
      stripe_session_id: session.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product_snapshot: {
        name: product.name,
        price: product.price,
        thumbnail_url: product.thumbnail_url || null,
        metadata: meta || {},
      },
    });

    return res.status(200).json({ ok: true, id: session.id, url: session.url });
  } catch (err) {
    console.error('create-session error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
