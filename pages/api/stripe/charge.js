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
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      let checkoutSession;
      if (req.body.priceId) {
        checkoutSession = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price: req.body.priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: 'https://manyagi.net/thank-you',
          cancel_url: 'https://manyagi.net/capital',
          customer_email: session.user.email,
          metadata: {
            userId: session.user.id,
            telegramId: req.body.telegramId || '',
          },
        });
        return res.status(200).json({ sessionId: checkoutSession.id });
      } else if (req.body.paymentMethodId && req.body.amount && req.body.description) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: req.body.amount,
          currency: 'usd',
          description: req.body.description,
          payment_method: req.body.paymentMethodId,
          confirm: true,
          return_url: 'https://manyagi.net/thank-you',
        });
        return res.status(200).json({ paymentIntent });
      }
      return res.status(200).json({ sessionId: checkoutSession?.id });
    } catch (error) {
      console.error('Stripe error:', error);
      return res.status(500).json({ error: 'Failed to process payment' });
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
      return res.status(400).json({ error: 'Webhook error' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const telegramId = session.metadata.telegramId || '';

      // Save subscription to Firestore
      await setDoc(doc(db, 'subscriptions', session.id), {
        userId: session.metadata.userId,
        email: session.customer_email,
        telegramId: telegramId,
        created: new Date(),
        plan: session.mode === 'subscription' ? 'Basic Signals' : 'One-Time Purchase',
        amount: session.amount_total ? session.amount_total / 100 : null,
      });

      // Send Telegram invite link if telegramId is provided
      if (telegramId) {
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramInviteLink = 'https://t.me/+HGRgldHTRlxjMThh'; // Your Telegram group invite link
        const message = `Welcome to Manyagi Capital Signals! Join our Telegram group for real-time updates: ${telegramInviteLink}`;

        try {
          await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            chat_id: telegramId,
            text: message,
          });
          console.log('Telegram invite sent to:', telegramId);
        } catch (error) {
          console.error('Telegram error:', error);
        }
      }

      console.log('Subscription saved to Firestore:', session);
    }

    return res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', ['POST', 'PUT']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}