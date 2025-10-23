// pages/api/realty/property.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'slug required' });

  try {
    const { data: property, error: pErr } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (pErr || !property) return res.status(404).json({ error: 'Property not found' });

    const { data: availability, error: aErr } = await supabaseAdmin
      .from('property_availability')
      .select('*')
      .eq('property_id', property.id)
      .order('date');

    if (aErr) throw aErr;

    res.status(200).json({ property, availability: availability || [] });
  } catch (err) {
    console.error('Realty property API error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
}