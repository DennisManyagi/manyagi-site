// pages/api/realty/rates.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  try {
    // ---- GET ----
    if (req.method === 'GET') {
      const { property_id } = req.query;
      if (!property_id)
        return res.status(400).json({ error: 'property_id required' });

      const { data, error } = await supabaseAdmin
        .from('realty_rates')
        .select('*')
        .eq('property_id', property_id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ ok: true, items: data || [] });
    }

    // ---- POST ----
    if (req.method === 'POST') {
      const body =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const {
        property_id,
        start_date,
        end_date,
        nightly_rate,
        min_nights,
        priority,
        notes,
      } = body || {};

      if (!property_id || !start_date || !end_date || !nightly_rate)
        return res.status(400).json({ error: 'missing required fields' });

      const { error } = await supabaseAdmin.from('realty_rates').insert({
        property_id,
        start_date,
        end_date,
        nightly_rate: Number(nightly_rate),
        min_nights: min_nights ? Number(min_nights) : null,
        priority: priority ? Number(priority) : 0,
        notes: notes || '',
      });

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    // ---- DELETE ----
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });

      const { error } = await supabaseAdmin
        .from('realty_rates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (e) {
    console.error('realty/rates error:', e);
    return res.status(500).json({ error: e.message });
  }
}
