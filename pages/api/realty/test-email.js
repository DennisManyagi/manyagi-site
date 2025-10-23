// pages/api/realty/test-email.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendItineraryEmail } from '@/lib/emails/itineraryEmail';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { property_id, email } = req.body;
  if (!property_id || !email) return res.status(400).json({ error: 'property_id and email required' });

  const { data: prop } = await supabaseAdmin.from('properties').select('name').eq('id', property_id).maybeSingle();
  if (!prop) return res.status(404).json({ error: 'Property not found' });

  try {
    await sendItineraryEmail({
      guestName: 'Test Guest',
      to: email,
      property: prop.name,
      checkin: '2025-10-25',
      checkout: '2025-10-28',
      guests: 2,
    });
    return res.status(200).json({ ok: true, message: 'Test email sent' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}