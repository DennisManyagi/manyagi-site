// pages/api/realty/lead.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      phone,
      interest_type, // 'buy' | 'sell' | 'manage' | 'rental_inquiry' | 'other'
      notes,
      property_id,
    } = req.body || {};

    if (!name || !email || !interest_type) {
      return res
        .status(400)
        .json({ error: 'Missing required fields' });
    }

    const { error } = await supabaseAdmin
      .from('realty_leads')
      .insert({
        name,
        email,
        phone: phone || null,
        interest_type,
        notes: notes || null,
        property_id: property_id || null,
        status: 'new',
      });

    if (error) throw error;

    return res
      .status(200)
      .json({ ok: true, message: 'Lead captured.' });
  } catch (err) {
    console.error('lead capture error:', err);
    return res
      .status(500)
      .json({ error: err.message || 'Internal error' });
  }
}
