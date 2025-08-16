// pages/api/stripe/charge.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { getSession } from 'next-auth/react';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      let checkoutSession;
      if (req.body.priceId) { // For subscriptions (e.g., capital.js)
        checkoutSession = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price: req.body.priceId, // e.g., 'price_1Rwfe5IFtQrr5DjcidsMeAOM'
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: 'https://manyagi.net/thank-you',
          cancel_url: 'https://manyagi.net/capital',
          customer_email: session.user.email,
          metadata: {
            userId: session.user.id,
          },
        });
        return res.status(200).json({ sessionId: checkoutSession.id });
      } else if (req.body.paymentMethodId && req.body.amount && req.body.description) { // For one-time (e.g., designs.js)
        // First, create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: req.body.amount,
          currency: 'usd',
          description: req.body.description,
          payment_method: req.body.paymentMethodId,
          confirm: true,
          return_url: 'https://manyagi.net/thank-you', // Handle return if needed
        });
        return res.status(200).json({ paymentIntent });
      }
      return res.status(200).json({ sessionId: checkoutSession?.id });
    } catch (error) {
      console.error('Stripe error:', error);
      return res.status(500).json({ error: 'Failed to process payment' });
    }
  } else if (req.method === 'PUT') {
    // Handle webhook for subscription events
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(400).json({ error: 'Webhook error' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // TODO: Save subscription to database (e.g., MongoDB)
      console.log('Subscription created:', session);
    }

    return res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', ['POST', 'PUT']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}