// pages/api/admin/fulfillment/retry.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createPrintfulOrder } from '@/lib/printful';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // --- Auth (admin only) ---
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data: userResp, error: getUserErr } = await supabaseAdmin.auth.getUser(token);
    if (getUserErr || !userResp?.user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: roleRow } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userResp.user.id)
      .maybeSingle();

    if ((roleRow?.role || 'user') !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // --- Inputs ---
    const { order_id, override_variant_id = null } = req.body || {};
    if (!order_id) return res.status(400).json({ error: 'order_id is required' });

    // --- Load order ---
    const { data: order, error: oErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .maybeSingle();
    if (oErr) throw oErr;
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if ((order.status || '').toLowerCase() !== 'paid') {
      return res.status(400).json({ error: 'Order is not paid' });
    }
    if (!order.stripe_session_id) {
      return res.status(400).json({ error: 'Missing stripe_session_id on order' });
    }

    // --- Load product & build items ---
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', order.product_id)
      .maybeSingle();

    const meta = product?.metadata || {};
    const quantity = Math.max(1, Number(order.quantity || 1));

    // If product includes a full multi-line item list, use it; else fall back to single variant
    let items = [];
    if (Array.isArray(meta.printful_items) && meta.printful_items.length > 0) {
      items = meta.printful_items.map(it => ({
        sync_variant_id: Number(it.sync_variant_id),
        quantity: Math.max(1, Number(it.quantity || quantity)),
      }));
    } else {
      const syncVariantId =
        override_variant_id ||
        meta.printful_sync_variant_id ||
        meta.printful_sync_variant ||
        null;

      if (!syncVariantId) {
        return res.status(400).json({
          error: 'Product is not configured for Printful (missing printful_sync_variant_id)',
        });
      }
      items = [{ sync_variant_id: Number(syncVariantId), quantity }];
    }

    // --- Get shipping details from original checkout session ---
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    const addr = session?.shipping_details?.address || null;
    if (!addr) {
      return res.status(400).json({
        error: 'This order has no shipping address; cannot send to Printful.',
      });
    }

    const recipient = {
      name: session?.customer_details?.name || 'Customer',
      address1: addr.line1 || '',
      city: addr.city || '',
      state_code: addr.state || '',
      country_code: addr.country || 'US',
      zip: addr.postal_code || '',
      phone: session?.customer_details?.phone || '',
      email: session?.customer_details?.email || '',
    };

    const packingSlip = {
      email: 'support@manyagi.net',
      phone: '',
      message: 'Thank you for supporting Manyagi!',
    };

    // Use stripe_session_id as external id for idempotency across webhook/retry
    const externalId = order.stripe_session_id;

    let pf;
    try {
      pf = await createPrintfulOrder({
        externalId,
        recipient,
        items,
        packingSlip,
      });
    } catch (e) {
      // If this fails because the external_id already exists, treat as success and fetch it
      const msg = e?.response?.data?.result || e?.response?.data || e?.message || '';
      const alreadyExists =
        typeof msg === 'string' && /external.*exist|already.*exist/i.test(msg);

      if (alreadyExists) {
        // Attempt to fetch by external_id
        try {
          const resp = await fetch(
            `https://api.printful.com/orders/@${encodeURIComponent(externalId)}`,
            { headers: { Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}` } }
          );
          if (resp.ok) {
            const j = await resp.json();
            pf = j?.result;
          } else {
            throw new Error('Order exists but could not fetch from Printful');
          }
        } catch (fetchErr) {
          console.warn('Printful fetch-by-externalId failed:', fetchErr?.message || fetchErr);
          throw e; // bubble original
        }
      } else {
        throw e; // real error
      }
    }

    // --- Persist fulfillment back on the order ---
    await supabaseAdmin
      .from('orders')
      .update({
        fulfillment_provider: 'printful',
        fulfillment_status: pf?.status || 'submitted',
        fulfillment_id: pf?.id ? String(pf.id) : order.fulfillment_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    return res.status(200).json({ ok: true, printful: pf });
  } catch (err) {
    console.error('fulfillment/retry error:', err?.response?.data || err.message);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
