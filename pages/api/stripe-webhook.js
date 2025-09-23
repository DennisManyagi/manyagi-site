import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramGroupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const { data: order } = await supabaseAdmin.from('orders').select('printful_order_id').eq('stripe_session_id', session.id).single();
        await supabaseAdmin.from('orders').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('stripe_session_id', session.id);
        if (session.mode === 'payment' && session.line_items?.data[0]?.price_data?.metadata?.type === 'merch' && order?.printful_order_id) {
          // Trigger Printful confirmation
          await axios.post('/api/printful/confirm', { order_id: order.printful_order_id });
        }
        break;
      case 'customer.subscription.created':
      case 'invoice.paid':
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const telegramId = subscription.metadata?.telegramId || customer.metadata?.telegramId;
        if (!telegramId || isNaN(telegramId)) return res.status(400).json({ error: 'Invalid Telegram ID' });

        await axios.post(`https://api.telegram.org/bot${telegramBotToken}/unbanChatMember`, {
          chat_id: telegramGroupChatId,
          user_id: telegramId,
        });

        await supabaseAdmin.from('subscriptions').upsert({
          stripe_subscription_id: subscription.id,
          user_id: null,
          status: 'active',
          plan_type: 'Basic Signals',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          telegram_id: telegramId.toString(),
          created_at: new Date().toISOString(),
        });

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
          await supabaseAdmin.from('subscriptions').delete().eq('telegram_id', deletedTelegramId.toString());
          await axios.post(`https://api.telegram.org/bot${telegramBotToken}/banChatMember`, {
            chat_id: telegramGroupChatId,
            user_id: deletedTelegramId,
          });
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