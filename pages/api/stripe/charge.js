// pages/api/stripe/charge.js
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase'; // Updated to absolute import
import fetch from 'node-fetch';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, telegramId, priceId, email, address } = req.body; // Added address for Printful

  try {
    if (!items && !priceId) {
      return res.status(400).json({ error: 'Missing items or priceId' });
    }

    const lineItems = items
      ? items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: { name: item.name, metadata: { type: item.productType } },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity || 1,
        }))
      : [
          {
            price: priceId,
            quantity: 1,
          },
        ];

    const mode = items ? 'payment' : 'subscription';
    const customerData = { email, metadata: { telegramId, address: JSON.stringify(address || {}) } };

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      success_url: `${process.env.NEXTAUTH_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/`,
      customer_email: email,
      ...customerData,
    });

    // Save to Supabase
    const totalAmount = lineItems.reduce((acc, li) => acc + (li.quantity * li.price_data.unit_amount / 100), 0);
    const { error: saveError } = await supabaseAdmin.from('orders').insert({
      stripe_session_id: checkoutSession.id,
      total_amount: totalAmount,
      status: 'pending',
      items: items || [],
      shipping_address: address ? { ...address } : null,
      user_id: null,
      created_at: new Date().toISOString(),
      type: mode === 'subscription' ? 'signals' : items[0]?.productType || 'general',
    });
    if (saveError) console.error('Supabase save error:', saveError);

    // For merch, pre-create Printful order if address provided
    if (items?.some(i => i.productType === 'merch') && address) {
      await fetch('/api/printful/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer: { ...address, name: email.split('@')[0] } }),
      });
    }

    return res.status(200).json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process payment' });
  }
}