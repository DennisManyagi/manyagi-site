// pages/api/realty/cleanup-holds.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  // Delete pending reservations older than 30 min
  const threshold = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin
    .from('realty_reservations')
    .delete()
    .eq('status', 'pending')
    .lt('created_at', threshold);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}