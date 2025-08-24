// pages/api/stripe/charge.js
import Stripe from 'stripe';
import { getSession } from 'next-auth/react';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  const { items, telegramId, priceId, email } = req.body;

  try {
    if (!items && !priceId) {
      return res.status(400).json({ error: 'Missing items or priceId' });
    }

    const lineItems = items
      ? items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: { name: item.name },
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

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: items ? 'payment' : 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/capital#subscribe`,
      customer_email: session?.user?.email || email,
      metadata: {
        userId: session?.user?.id || 'guest',
        telegramId: telegramId || '',
      },
    });

    return res.status(200).json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process payment' });
  }
}