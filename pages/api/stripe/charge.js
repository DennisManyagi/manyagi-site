import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, telegramId, priceId, email, address } = req.body;

  try {
    if (!items && !priceId) {
      return res.status(400).json({ error: 'Missing items or priceId' });
    }

    const lineItems = items
      ? items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: { 
              name: item.name, 
              metadata: { 
                division: item.division || 'general',
                type: item.productType || 'general',
                product_id: item.id 
              } 
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity || 1,
        }))
      : [{ price: priceId, quantity: 1 }];

    const mode = items ? 'payment' : 'subscription';

    const sessionMetadata = {
      telegramId: telegramId ?? '',
      address: JSON.stringify(address || {}),
    };

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      success_url: `${process.env.SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/`,
      customer_email: email,
      metadata: sessionMetadata, // <-- keep metadata on the session too
    });

    // Calculate total amount
    let totalAmount = 0;
    if (mode === 'subscription') {
      const pricePromises = lineItems.map(async (li) => {
        if (li.price_data?.unit_amount) return li.price_data.unit_amount / 100;
        const price = await stripe.prices.retrieve(li.price);
        return price.unit_amount / 100;
      });
      const prices = await Promise.all(pricePromises);
      totalAmount = lineItems.reduce((acc, li, index) => acc + (li.quantity * prices[index]), 0);
    } else {
      totalAmount = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    }

    // Save to Supabase
    const { error: saveError } = await supabaseAdmin.from('orders').insert({
      stripe_session_id: checkoutSession.id,
      total_amount: totalAmount,
      status: 'pending',
      items: items || [],
      shipping_address: address ? { ...address } : null,
      user_id: null,
      division: items?.[0]?.division || 'general',
      type: mode === 'subscription' ? 'signals' : items?.[0]?.productType || 'general',
      created_at: new Date().toISOString(),
    }).select().single();
    
    if (saveError) {
      console.error('Supabase save error:', saveError);
      return res.status(500).json({ error: 'Failed to save order' });
    }

    return res.status(200).json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process payment' });
  }
}
