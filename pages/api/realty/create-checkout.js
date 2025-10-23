// pages/api/realty/create-checkout.js
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    property_id,
    checkin,
    checkout,
    guests = 1,
    guest_name,
    guest_email,
    guest_phone,
    notes,
  } = req.body;

  if (!property_id || !checkin || !checkout || !guest_name || !guest_email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get quote
  const quoteRes = await fetch('/api/realty/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ property_id, checkin, checkout }),
  });
  const quote = await quoteRes.json();
  if (!quote.ok) return res.status(500).json({ error: quote.error });

  // Create pending reservation
  const nights = quote.summary.nights;
  const amountCents = Math.round(quote.summary.total * 100);
  const { data: reservation, error } = await supabaseAdmin.from('realty_reservations').insert({
    property_id,
    checkin,
    checkout,
    nights,
    guests,
    guest_name,
    guest_email,
    guest_phone,
    notes,
    amount_cents: amountCents,
    currency: 'usd',
    status: 'pending',
  }).select('*').maybeSingle();
  if (error) return res.status(500).json({ error: error.message });

  // Create Stripe session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Booking at Property ID ${property_id}` },
        unit_amount: amountCents,
      },
      quantity: 1,
    }],
    metadata: { type: 'realty_booking', reservation_id: reservation.id },
    success_url: `${req.headers.origin}/realty/booking-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}/realty/${property_id}?cancelled=true`,
  });

  // Update reservation with session ID
  await supabaseAdmin.from('realty_reservations').update({ stripe_session_id: session.id }).eq('id', reservation.id);

  res.status(200).json({ url: session.url });
}