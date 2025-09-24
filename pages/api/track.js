import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  const { order_id } = req.query;

  if (!order_id) {
    return res.status(400).json({ error: 'Missing order_id' });
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();
      
    if (error || !order) throw new Error('Order not found');

    res.status(200).json({
      status: order.status,
      estimated_delivery: order.updated_at,
      division: order.division,
      total: order.total_amount,
      items: order.items
    });
  } catch (error) {
    console.error('Supabase track error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
}
