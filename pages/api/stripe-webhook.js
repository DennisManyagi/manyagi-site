// pages/api/stripe-webhook.js
import { buffer } from 'micro';
import Stripe from 'stripe';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'invoice.paid':
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const telegramId = customer.metadata.telegramId || subscription.metadata.telegramId;
      const email = subscription.customer_email || customer.email;

      if (!telegramId || isNaN(telegramId)) {
        console.error('Invalid or missing Telegram ID');
        return res.status(400).json({ error: 'Invalid Telegram ID' });
      }

      await setDoc(doc(db, 'subscriptions', telegramId.toString()), {
        email: email,
        telegramId: telegramId,
        subscriptionId: subscription.id,
        status: 'active',
        subscribedAt: new Date(),
      });

      const message = `Welcome to Manyagi Capital Signals! Join our Telegram group: https://t.me/joinchat/${telegramGroupChatId}`;

      await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id: telegramId,
        text: message,
      });
      break;
    case 'customer.subscription.deleted':
    case 'invoice.payment_failed':
      const deletedSubscription = event.data.object;
      const deletedCustomer = await stripe.customers.retrieve(deletedSubscription.customer);
      const deletedTelegramId = deletedCustomer.metadata.telegramId || deletedSubscription.metadata.telegramId;

      if (deletedTelegramId) {
        await deleteDoc(doc(db, 'subscriptions', deletedTelegramId.toString()));
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
}