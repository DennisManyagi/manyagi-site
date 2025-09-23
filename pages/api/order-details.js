// pages/api/order-details.js
import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const { data, error } = await supabaseAdmin.from('orders').select('*').eq('stripe_session_id', session_id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json({ ...data, type: data.type || 'general' });
  } catch (error) {
    console.error('Supabase error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
}