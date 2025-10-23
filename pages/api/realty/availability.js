// pages/api/realty/availability.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { property_id } = req.query;
  if (!property_id) return res.status(400).json({ error: 'property_id required' });

  const { data, error } = await supabaseAdmin
    .from('property_availability')
    .select('*')
    .eq('property_id', property_id)
    .order('date');

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ items: data });
}