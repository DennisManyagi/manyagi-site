// pages/api/realty/external-blocks.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { property_id } = req.query;
    if (!property_id) return res.status(400).json({ error: 'property_id required' });
    const { data, error } = await supabaseAdmin
      .from('realty_external_blocks')
      .select('*')
      .eq('property_id', property_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data });
  }

  if (req.method === 'POST') {
    const { property_id, starts_on, ends_on, source, uid } = req.body || {};
    if (!property_id || !starts_on || !ends_on || !source) return res.status(400).json({ error: 'required fields missing' });
    const { error } = await supabaseAdmin.from('realty_external_blocks').insert({ property_id, starts_on, ends_on, source, uid });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { error } = await supabaseAdmin.from('realty_external_blocks').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}