// pages/api/stripe/charge.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { getSession } from 'next-auth/react';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
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
        cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
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
  } else if (req.method === 'PUT') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const telegramId = session.metadata.telegramId || '';

      try {
        await setDoc(doc(db, 'orders', session.id), {
          userId: session.metadata.userId,
          email: session.customer_email,
          telegramId: telegramId,
          created: new Date(),
          plan: session.mode === 'subscription' ? 'Basic Signals' : 'Merch Purchase',
          amount: session.amount_total ? session.amount_total / 100 : null,
          items: session.mode === 'payment' ? session.line_items?.data.map(item => ({
            name: item.description,
            quantity: item.quantity,
            amount: item.amount_total / 100,
          })) : null,
        });

        if (telegramId && session.mode === 'subscription') {
          const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
          const telegramInviteLink = 'https://t.me/+HGRgldHTRlxjMThh';
          const message = `Welcome to Manyagi Capital Signals! Join our Telegram group for real-time updates: ${telegramInviteLink}`;

          await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            chat_id: telegramId,
            text: message,
          });
        }
      } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({ error: 'Failed to process webhook' });
      }
    }

    return res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', ['POST', 'PUT']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}