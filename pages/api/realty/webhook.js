// pages/api/realty/webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendItineraryEmail } from '@/lib/emails/itineraryEmail';
import { sendBookingReceipt } from '@/lib/emails/bookingReceipt';

// We need the raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  let event;
  const sig = req.headers['stripe-signature'];

  let buf;
  try {
    buf = await buffer(req);
  } catch (e) {
    console.error('Webhook: failed to read buffer', e);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // <-- set this in env
    );
  } catch (err) {
    console.error('Webhook signature verify failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // We only really care about a successful Checkout payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // We stored these in create-checkout.js metadata
    const {
      reservation_id,
      property_id,
      checkin,
      checkout,
      guest_name,
      guest_email,
      guest_phone,
      notes,
    } = session.metadata || {};

    try {
      // 1. Mark reservation as paid
      const { error: updErr } = await supabaseAdmin
        .from('realty_reservations')
        .update({
          status: 'paid',
        })
        .eq('id', reservation_id);

      if (updErr) {
        console.error('Webhook: failed to update reservation:', updErr.message);
      }

      // 2. Load property details for email context
      const { data: propRow, error: propErr } = await supabaseAdmin
        .from('properties')
        .select('name')
        .eq('id', property_id)
        .maybeSingle();

      if (propErr) {
        console.error('Webhook: property lookup err', propErr.message);
      }

      // 3. Send itinerary email (guest gets arrival details)
      try {
        await sendItineraryEmail({
          guestName: guest_name || 'Guest',
          to: guest_email,
          property: propRow?.name || 'Property',
          checkin,
          checkout,
          guests: session.metadata?.guests || '1',
          replyTo: 'realty@manyagi.net',
        });
      } catch (e) {
        console.error('Webhook: itinerary email failed', e);
      }

      // 4. Send receipt email (basic confirmation / thank you)
      try {
        await sendBookingReceipt({
          guestName: guest_name || 'Guest',
          to: guest_email,
          property: propRow?.name || 'Property',
          checkin,
          checkout,
          guests: session.metadata?.guests || '1',
          replyTo: 'realty@manyagi.net',
        });
      } catch (e) {
        console.error('Webhook: receipt email failed', e);
      }

      // 5. (Optional) You could also insert into property_availability here
      // so your frontend calendar shows it as blocked. We will instead expose
      // paid reservations via /api/realty/calendar-blocks.js.

      console.log(
        `[Realty] Reservation ${reservation_id} marked paid for ${propRow?.name}`
      );
    } catch (e) {
      console.error('Webhook crashed:', e);
      // We purposely do NOT fail the webhook with 500 because Stripe will retry.
      // Returning 200 tells Stripe we're good. If you want retries, return 400/500.
    }
  }

  // Stripe requires 2xx fast
  res.status(200).json({ received: true });
}
