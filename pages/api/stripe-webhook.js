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
    console.error('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log('Webhook event received:', event.type, event.id);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Processing checkout.session.completed:', session.id);
        if (session.mode === 'subscription') {
          const telegramId = session.metadata.telegramId;
          const email = session.customer_email;

          if (!telegramId || isNaN(telegramId)) {
            console.error('Invalid or missing Telegram ID:', telegramId);
            return res.status(400).json({ error: 'Invalid Telegram ID' });
          }

          // Save to Firebase orders
          try {
            await setDoc(doc(db, 'orders', session.id), {
              userId: session.metadata.userId || 'guest',
              email: email,
              telegramId: telegramId,
              created: new Date(),
              plan: 'Basic Signals',
              amount: session.amount_total ? session.amount_total / 100 : null,
            });
            console.log('Saved order to Firestore:', session.id);
          } catch (err) {
            console.error('Failed to save order to Firestore:', err.message);
            throw err;
          }
        }
        break;

      case 'customer.subscription.created':
      case 'invoice.paid':
        const subscription = event.data.object;
        console.log(`Processing ${event.type}:`, subscription.id);
        const customer = await stripe.customers.retrieve(subscription.customer);
        const telegramId = subscription.metadata?.telegramId || customer.metadata?.telegramId;
        const email = subscription.customer_email || customer.email;

        if (!telegramId || isNaN(telegramId)) {
          console.error('Invalid or missing Telegram ID:', telegramId);
          return res.status(400).json({ error: 'Invalid Telegram ID' });
        }

        // Unban user
        try {
          await axios.post(`https://api.telegram.org/bot${telegramBotToken}/unbanChatMember`, {
            chat_id: telegramGroupChatId,
            user_id: telegramId,
          });
          console.log('Unbanned Telegram user:', telegramId);
        } catch (err) {
          console.error('Failed to unban Telegram user:', err.message);
          throw err;
        }

        // Save subscription to Firebase
        try {
          await setDoc(doc(db, 'subscriptions', telegramId.toString()), {
            email: email,
            telegramId: telegramId,
            subscriptionId: subscription.id,
            status: 'active',
            subscribedAt: new Date(),
          });
          console.log('Saved subscription to Firestore:', telegramId);
        } catch (err) {
          console.error('Failed to save subscription to Firestore:', err.message);
          throw err;
        }

        // Send Telegram invite
        const message = `Welcome to Manyagi Capital Signals! Join our Telegram group for real-time updates: ${process.env.TELEGRAM_INVITE_LINK}`;
        try {
          await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            chat_id: telegramId,
            text: message,
          });
          console.log('Sent Telegram invite to:', telegramId);
        } catch (err) {
          console.error('Failed to send Telegram invite:', err.message);
          throw err;
        }
        break;

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed':
        const deletedSubscription = event.data.object;
        console.log(`Processing ${event.type}:`, deletedSubscription.id);
        const deletedCustomer = await stripe.customers.retrieve(deletedSubscription.customer);
        const deletedTelegramId = deletedSubscription.metadata?.telegramId || deletedCustomer.metadata?.telegramId;

        if (deletedTelegramId) {
          // Remove from Firebase
          try {
            await deleteDoc(doc(db, 'subscriptions', deletedTelegramId.toString()));
            console.log('Deleted subscription from Firestore:', deletedTelegramId);
          } catch (err) {
            console.error('Failed to delete subscription from Firestore:', err.message);
            throw err;
          }

          // Ban and kick from Telegram group
          try {
            await axios.post(`https://api.telegram.org/bot${telegramBotToken}/banChatMember`, {
              chat_id: telegramGroupChatId,
              user_id: deletedTelegramId,
            });
            console.log('Banned Telegram user:', deletedTelegramId);
          } catch (err) {
            console.error('Failed to ban Telegram user:', err.message);
            throw err;
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    return res.status(500).json({ error: `Webhook processing failed: ${err.message}` });
  }
}