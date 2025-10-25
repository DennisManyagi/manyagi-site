// pages/api/realty/create-checkout.js
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calculateQuote } from './quote'; // reuse the logic, no internal fetch

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST')
      return res.status(405).json({ error: 'Method not allowed' });

    const {
      property_id,
      checkin,
      checkout,
      guests = 1,
      guest_name,
      guest_email,
      guest_phone,
      notes,
    } = req.body || {};

    if (
      !property_id ||
      !checkin ||
      !checkout ||
      !guest_name ||
      !guest_email
    ) {
      return res
        .status(400)
        .json({ error: 'Missing required fields' });
    }

    // 1. Load property row
    const { data: propRow, error: propErr } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .maybeSingle();

    if (propErr)
      return res.status(500).json({ error: propErr.message });
    if (!propRow)
      return res.status(404).json({ error: 'property not found' });

    // 2. Load override rates for quote calculation
    const { data: rateRows, error: rateErr } = await supabaseAdmin
      .from('realty_rates')
      .select('*')
      .eq('property_id', property_id);

    if (rateErr)
      return res.status(500).json({ error: rateErr.message });

    // 3. Build quote on the server (NO fetch('/api/...'))
    const quote = calculateQuote({
      propRow,
      rates: rateRows || [],
      checkin,
      checkout,
    });

    if (!quote.ok) {
      return res
        .status(500)
        .json({ error: quote.error || 'Failed to build quote' });
    }

    const amountCents = Math.round(quote.summary.total * 100);
    const nightsCount = quote.summary.nights;

    // 4. Create "pending" reservation in Supabase
    const { data: reservation, error: resErr } = await supabaseAdmin
      .from('realty_reservations')
      .insert({
        property_id,
        checkin,
        checkout,
        nights: nightsCount,
        guests,
        guest_name,
        guest_email,
        guest_phone,
        notes,
        amount_cents: amountCents,
        currency: 'usd',
        status: 'pending',
      })
      .select('*')
      .maybeSingle();

    if (resErr)
      return res.status(500).json({ error: resErr.message });

    // 5. Create Stripe Checkout Session
    const successUrl = `${req.headers.origin}/realty/booking-success?session_id={CHECKOUT_SESSION_ID}`;
    // cancel should go back to the property detail, which is /realty/[slug]
    const cancelUrl = `${req.headers.origin}/realty/${propRow.slug}?cancelled=true`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking: ${propRow.name}`,
              description: `Check-in ${checkin} → Check-out ${checkout}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'realty_booking',
        reservation_id: reservation.id,
        property_id: property_id,
        checkin,
        checkout,
        guest_name,
        guest_email,
        guest_phone: guest_phone || '',
        notes: notes || '',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // 6. Store Stripe session ID back on reservation
    await supabaseAdmin
      .from('realty_reservations')
      .update({ stripe_session_id: session.id })
      .eq('id', reservation.id);

    // 7. Send the Stripe hosted checkout URL back to frontend
    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('create-checkout crash:', e);
    return res.status(500).json({
      error: e.message || 'checkout failed',
    });
  }
}
