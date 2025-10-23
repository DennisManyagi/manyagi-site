// pages/api/realty/book.js
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      property_id,
      checkin,        // 'YYYY-MM-DD'
      checkout,       // 'YYYY-MM-DD' (exclusive)
      guests = 1,
      quote_total_cents,        // from /api/realty/quote (server validates)
      currency = 'usd',
      // NEW guest details
      guestName,
      guestEmail,
      guestPhone,
      notes,
      // NEW deposit
      includeDamageDeposit = false,
      success_url,
      cancel_url,
    } = req.body || {};

    if (!property_id || !checkin || !checkout || !quote_total_cents) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Load property for deposit & name
    const { data: prop } = await supabaseAdmin
      .from('properties')
      .select('id, name, metadata')
      .eq('id', property_id)
      .maybeSingle();
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    const meta = prop.metadata || {};
    const depositCents = includeDamageDeposit ? Number(meta.damage_deposit_cents || 0) : 0;

    // Create or update pending reservation row (soft hold tied to Stripe session)
    const nights = Math.max(
      1,
      Math.round(
        (new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    // Stripe line items
    const line_items = [
      {
        price_data: {
          currency,
          unit_amount: Number(quote_total_cents),
          product_data: {
            name: `${prop.name} — ${checkin} → ${checkout} (${nights} nights)`,
            metadata: { division: 'realty', property_id },
          },
        },
        quantity: 1,
      },
    ];

    if (depositCents > 0) {
      line_items.push({
        price_data: {
          currency,
          unit_amount: depositCents,
          product_data: {
            name: 'Damage Deposit (refundable)',
            metadata: { division: 'realty', property_id, type: 'deposit' },
          },
        },
        quantity: 1,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: guestEmail || undefined,
      success_url: success_url || `${baseUrl}/realty/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${baseUrl}/realty/booking-cancelled`,
      metadata: {
        type: 'realty_booking',
        property_id,
        checkin,
        checkout,
        guests: String(guests),
        nights: String(nights),
        guestName: guestName || '',
        guestEmail: guestEmail || '',
        guestPhone: guestPhone || '',
        notes: notes || '',
        includeDamageDeposit: includeDamageDeposit ? 'true' : 'false',
      },
    });

    // Create or update pending hold row keyed by session id
    await supabaseAdmin.from('realty_reservations')
      .upsert({
        property_id,
        checkin,
        checkout,
        nights,
        guests,
        status: 'pending',
        amount_cents: Number(quote_total_cents) + Number(depositCents || 0),
        currency,
        stripe_session_id: session.id,
        guest_name: guestName || null,
        guest_email: guestEmail || null,
        guest_phone: guestPhone || null,
        notes: notes || null,
      }, { onConflict: 'stripe_session_id' });

    return res.status(200).json({ ok: true, url: session.url, session_id: session.id });
  } catch (e) {
    console.error('book error', e);
    return res.status(500).json({ error: e.message });
  }
}