// pages/api/stripe-webhook.js
import { buffer } from 'micro';
import Stripe from 'stripe';
import axios from 'axios';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createPrintfulOrder } from '@/lib/printful';
import { sendEmail } from '@/lib/sendEmail';

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
        // Expand
        const session = await stripe.checkout.sessions.retrieve(
          event.data.object.id,
          { expand: ['customer_details', 'shipping_details', 'payment_intent'] }
        );

        // --- Realty bookings ---------------------------------------
        if (session?.metadata?.type === 'realty_booking') {
          const {
            property_id, checkin, checkout, guests, guestEmail, guestName,
          } = session.metadata;

          // 1) Mark reservation row paid
          await supabaseAdmin
            .from('realty_reservations')
            .update({
              status: 'paid',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_session_id', session.id);

          // 2) Fetch property for name and ical URL
          const { data: prop } = await supabaseAdmin
            .from('properties')
            .select('id, name, metadata')
            .eq('id', property_id)
            .maybeSingle();

          const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://manyagi.net';
          const icsUrl = `${site}/api/realty/ical-export?property_id=${property_id}`;
          const slug = prop?.metadata?.slug || prop?.id;
          const detailsUrl = `${site}/realty/${slug}`;

          // 3) Email the itinerary (if SMTP configured and guestEmail present)
          if (guestEmail) {
            const html = itineraryEmailHTML({
              propertyName: prop?.name,
              checkin, checkout, guests,
              guestName,
              icsUrl,
              detailsUrl,
              supportEmail: process.env.SUPPORT_EMAIL || 'realty@manyagi.net',
            });
            try { await sendEmail({ to: guestEmail, subject: 'Your Manyagi stay is confirmed', html }); }
            catch (e) { console.warn('Email send failed:', e.message); }
          }

          break;
        }

        // --- Physical merch fulfillment (kept from your version) ---
        const email = session?.customer_details?.email || null;
        const name  = session?.customer_details?.name || null;
        const addr  = session?.shipping_details?.address || null;

        await supabaseAdmin
          .from('orders')
          .update({
            status: 'paid',
            customer_email: email,
            customer_name: name,
            shipping_snapshot: addr ? {
              line1: addr.line1 || '',
              line2: addr.line2 || '',
              city: addr.city || '',
              state: addr.state || '',
              postal_code: addr.postal_code || '',
              country: addr.country || '',
            } : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', session.id);

        try {
          const { data: orderRow } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('stripe_session_id', session.id)
            .maybeSingle();

          if (!orderRow) break;

          const { data: product } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', orderRow.product_id)
            .maybeSingle();

          const meta = product?.metadata || {};
          const syncVariantId = meta.printful_sync_variant_id || meta.printful_sync_variant || null;

          const haveShippingAddress = Boolean(session?.shipping_details?.address?.line1);
          if (syncVariantId && haveShippingAddress) {
            const a = session.shipping_details.address;
            const recipient = {
              name: session?.customer_details?.name || 'Customer',
              address1: a.line1 || '',
              address2: a.line2 || '',
              city: a.city || '',
              state_code: a.state || '',
              country_code: a.country || 'US',
              zip: a.postal_code || '',
              phone: session?.customer_details?.phone || '',
              email: session?.customer_details?.email || '',
            };

            const qty = Math.max(1, Number(orderRow?.quantity || 1));
            const items = [{ sync_variant_id: Number(syncVariantId), quantity: qty }];

            const packingSlip = {
              email: 'support@manyagi.net',
              phone: '',
              message: 'Thank you for supporting Manyagi!',
            };

            try {
              const pf = await createPrintfulOrder({
                externalId: session.id,
                recipient,
                items,
                packingSlip,
              });

              await supabaseAdmin
                .from('orders')
                .update({
                  fulfillment_provider: 'printful',
                  fulfillment_status: pf?.status || 'submitted',
                  fulfillment_id: pf?.id ? String(pf.id) : null,
                  updated_at: new Date().toISOString(),
                })
                .eq('stripe_session_id', session.id);
            } catch (pfErr) {
              await supabaseAdmin
                .from('orders')
                .update({
                  fulfillment_provider: 'printful',
                  fulfillment_status: 'error',
                  fulfillment_error: String(pfErr?.response?.data?.error || pfErr.message || 'unknown'),
                  updated_at: new Date().toISOString(),
                })
                .eq('stripe_session_id', session.id);
              console.warn('Printful error:', pfErr?.response?.data || pfErr.message);
            }
          }
        } catch (fulfillErr) {
          console.warn('Fulfillment skipped:', fulfillErr?.response?.data || fulfillErr.message);
        }

        break;
      }

      // ====== your Telegram + Subscriptions logic (unchanged) ======
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