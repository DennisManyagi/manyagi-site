import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
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
      case 'checkout.session.completed': {
        const session = event.data.object;
        await supabaseAdmin
          .from('orders')
          .update({ status: 'paid', updated_at: new Date().toISOString() })
          .eq('stripe_session_id', session.id);
        break;
      }

      case 'customer.subscription.created': {
        // Optional early unban for new subs (metadata often present here)
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const telegramId =
          subscription?.metadata?.telegramId ||
          customer?.metadata?.telegramId;

        if (telegramId && !isNaN(telegramId)) {
          try {
            await axios.post(`https://api.telegram.org/bot${telegramBotToken}/unbanChatMember`, {
              chat_id: telegramGroupChatId,
              user_id: telegramId,
            });
          } catch (tgErr) {
            console.warn('Telegram unban (created) error:', tgErr?.response?.data || tgErr.message);
          }
        }
        break;
      }

      case 'invoice.paid': {
        // 🔑 This is an Invoice, not a Subscription object
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subId = invoice.subscription;

        const [subscription, customer] = await Promise.all([
          subId ? stripe.subscriptions.retrieve(subId) : null,
          customerId ? stripe.customers.retrieve(customerId) : null,
        ]);

        const telegramId =
          subscription?.metadata?.telegramId ||
          customer?.metadata?.telegramId ||
          invoice?.metadata?.telegramId;

        if (!telegramId || isNaN(telegramId)) {
          console.warn(`[stripe-webhook] Missing/invalid Telegram ID, event=${event.type}, invoice=${invoice.id}`);
          break;
        }

        // Unban in Telegram (best-effort)
        try {
          await axios.post(`https://api.telegram.org/bot${telegramBotToken}/unbanChatMember`, {
            chat_id: telegramGroupChatId,
            user_id: telegramId,
          });
        } catch (tgErr) {
          console.warn('Telegram unban error:', tgErr?.response?.data || tgErr.message);
        }

        // Upsert subscription record in DB
        const periodStart = subscription?.current_period_start
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : new Date().toISOString();
        const periodEnd = subscription?.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        await supabaseAdmin.from('subscriptions').upsert({
          stripe_subscription_id: subId || null,
          user_id: null,
          status: 'active',
          plan_type: 'Basic Signals',
          division: 'capital',
          current_period_start: periodStart,
          current_period_end: periodEnd,
          telegram_id: String(telegramId),
          created_at: new Date().toISOString(),
        });

        // Welcome DM (best-effort)
        try {
          const message = `Welcome to Manyagi Capital Signals! Join our Telegram group for real-time updates: ${process.env.TELEGRAM_INVITE_LINK}`;
          await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            chat_id: telegramId,
            text: message,
          });
        } catch (tgMsgErr) {
          console.warn('Telegram welcome message error:', tgMsgErr?.response?.data || tgMsgErr.message);
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const obj = event.data.object;
        const customer = await stripe.customers.retrieve(obj.customer);
        const telegramId = obj.metadata?.telegramId || customer?.metadata?.telegramId;

        if (telegramId) {
          await supabaseAdmin.from('subscriptions').delete().eq('telegram_id', String(telegramId));
          try {
            await axios.post(`https://api.telegram.org/bot${telegramBotToken}/banChatMember`, {
              chat_id: telegramGroupChatId,
              user_id: telegramId,
            });
          } catch (tgBanErr) {
            console.warn('Telegram ban error:', tgBanErr?.response?.data || tgBanErr.message);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    return res.status(500).json({ error: `Webhook processing failed: ${err.message}` });
  }
}
