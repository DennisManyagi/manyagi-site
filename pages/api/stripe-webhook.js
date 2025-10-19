// pages/api/stripe-webhook.js
import { buffer } from 'micro';
import Stripe from 'stripe';
import axios from 'axios';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createPrintfulOrder } from '@/lib/printful';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramGroupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;

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

        // 1) Mark order as paid
        await supabaseAdmin
          .from('orders')
          .update({ status: 'paid', updated_at: new Date().toISOString() })
          .eq('stripe_session_id', session.id);

        // 2) Try automatic Printful fulfillment (only if product is configured)
        try {
          // Load the pending order (to get product_id)
          const { data: orderRow } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('stripe_session_id', session.id)
            .maybeSingle();

          if (orderRow?.product_id) {
            const { data: product } = await supabaseAdmin
              .from('products')
              .select('*')
              .eq('id', orderRow.product_id)
              .maybeSingle();

            const meta = product?.metadata || {};
            const syncVariantId = meta.printful_sync_variant_id || meta.printful_sync_variant || null;

            // We only fulfill if:
            // - The product is set up with a Printful "sync_variant_id"
            // - Stripe collected a shipping address on the session
            if (syncVariantId && session?.shipping_details?.address) {
              const addr = session.shipping_details.address || {};
              const recipient = {
                name: session?.customer_details?.name || 'Customer',
                address1: addr.line1 || '',
                city: addr.city || '',
                state_code: addr.state || '',
                country_code: addr.country || 'US',
                zip: addr.postal_code || '',
                phone: session?.customer_details?.phone || '',
                email: session?.customer_details?.email || '',
              };

              const items = [{ sync_variant_id: Number(syncVariantId), quantity: 1 }];

              // Optional: add branding on packing slip
              const packingSlip = {
                email: 'support@manyagi.net',
                phone: '',
                message: 'Thank you for supporting Manyagi!',
              };

              const pf = await createPrintfulOrder({
                externalId: session.id,
                recipient,
                items,
                packingSlip,
              });

              // Save fulfillment data back to order
              await supabaseAdmin
                .from('orders')
                .update({
                  fulfillment_provider: 'printful',
                  fulfillment_status: pf?.status || 'submitted',
                  fulfillment_id: pf?.id ? String(pf.id) : null,
                  updated_at: new Date().toISOString(),
                })
                .eq('stripe_session_id', session.id);
            }
          }
        } catch (fulfillErr) {
          console.warn('Printful fulfillment skipped/failed:', fulfillErr?.response?.data || fulfillErr.message);
          // We do not throw here — payment is already captured. You can re-try fulfillment from an admin tool later.
        }

        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const telegramId = subscription?.metadata?.telegramId || customer?.metadata?.telegramId;

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

        try {
          await axios.post(`https://api.telegram.org/bot${telegramBotToken}/unbanChatMember`, {
            chat_id: telegramGroupChatId,
            user_id: telegramId,
          });
        } catch (tgErr) {
          console.warn('Telegram unban error:', tgErr?.response?.data || tgErr.message);
        }

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
