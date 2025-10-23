// pages/api/realty/send-booking-confirmation.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendItineraryEmail } from '@/lib/emails/itineraryEmail';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const { data: resv } = await supabaseAdmin.from('realty_reservations').select('*').eq('stripe_session_id', session_id).maybeSingle();
  if (!resv) return res.status(404).json({ error: 'Reservation not found' });

  const { data: prop } = await supabaseAdmin.from('properties').select('name').eq('id', resv.property_id).maybeSingle();

  try {
    await sendItineraryEmail({
      guestName: resv.guest_name,
      to: resv.guest_email,
      property: prop?.name || 'Property',
      checkin: resv.checkin,
      checkout: resv.checkout,
      guests: resv.guests,
      replyTo: 'realty@manyagi.net',
    });

    await sendItineraryEmail({
      type: 'receipt',
      guestName: resv.guest_name,
      to: resv.guest_email,
      property: prop?.name || 'Property',
      checkin: resv.checkin,
      checkout: resv.checkout,
      guests: resv.guests,
      replyTo: 'realty@manyagi.net',
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}