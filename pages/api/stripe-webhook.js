// pages/api/stripe-webhook.js
import { buffer } from 'micro';
import Stripe from 'stripe';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramGroupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        if (session.mode === 'subscription') {
          const telegramId = session.metadata.telegramId;
          const email = session.customer_email;

          if (!telegramId || isNaN(telegramId)) {
            console.error('Invalid or missing Telegram ID');
            return res.status(400).json({ error: 'Invalid Telegram ID' });
          }

          // Save to Firebase orders for tracking
          await setDoc(doc(db, 'orders', session.id), {
            userId: session.metadata.userId || 'guest',
            email: email,
            telegramId: telegramId,
            created: new Date(),
            plan: 'Basic Signals',
            amount: session.amount_total ? session.amount_total / 100 : null,
          });
        }
        break;

      case 'customer.subscription.created':
      case 'invoice.paid':
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const telegramId = subscription.metadata?.telegramId || customer.metadata?.telegramId;
        const email = subscription.customer_email || customer.email;

        if (!telegramId || isNaN(telegramId)) {
          console.error('Invalid or missing Telegram ID');
          return res.status(400).json({ error: 'Invalid Telegram ID' });
        }

        // Unban user to allow rejoining if previously banned
        await axios.post(`https://api.telegram.org/bot${telegramBotToken}/unbanChatMember`, {
          chat_id: telegramGroupChatId,
          user_id: telegramId,
        });

        // Save subscription to Firebase
        await setDoc(doc(db, 'subscriptions', telegramId.toString()), {
          email: email,
          telegramId: telegramId,
          subscriptionId: subscription.id,
          status: 'active',
          subscribedAt: new Date(),
        });

        // Send Telegram invite
        const message = `Welcome to Manyagi Capital Signals! Join our Telegram group for real-time updates: ${process.env.TELEGRAM_INVITE_LINK}`;
        await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          chat_id: telegramId,
          text: message,
        });
        break;

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed':
        const deletedSubscription = event.data.object;
        const deletedCustomer = await stripe.customers.retrieve(deletedSubscription.customer);
        const deletedTelegramId = deletedSubscription.metadata?.telegramId || deletedCustomer.metadata?.telegramId;

        if (deletedTelegramId) {
          // Remove from Firebase
          await deleteDoc(doc(db, 'subscriptions', deletedTelegramId.toString()));
          // Ban and kick from Telegram group
          await axios.post(`https://api.telegram.org/bot${telegramBotToken}/banChatMember`, {
            chat_id: telegramGroupChatId,
            user_id: deletedTelegramId,
          });
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Failed to process webhook' });
  }
}