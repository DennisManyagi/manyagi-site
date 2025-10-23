// pages/api/realty/booking-summary.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const { data: resv } = await supabaseAdmin.from('realty_reservations').select('*').eq('stripe_session_id', session_id).maybeSingle();
  if (!resv) return res.status(404).json({ error: 'Reservation not found' });

  const { data: prop } = await supabaseAdmin.from('properties').select('name').eq('id', resv.property_id).maybeSingle();

  return res.status(200).json({
    property: prop?.name || 'Unknown',
    checkin: resv.checkin,
    checkout: resv.checkout,
    guests: resv.guests,
    status: resv.status,
  });
}