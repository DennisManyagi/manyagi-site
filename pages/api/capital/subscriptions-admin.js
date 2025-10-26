// pages/api/capital/subscriptions-admin.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Returns:
 * {
 *   ok: true,
 *   mrr: 123.45,
 *   subs: [
 *     {
 *       id,
 *       telegram_id,
 *       plan_type,
 *       status,
 *       current_period_end,
 *       current_period_start,
 *       amount_usd
 *     },
 *     ...
 *   ]
 * }
 *
 * Notes:
 * - We assume "Basic Signals" is $29.99/mo.
 * - You can change this mapping later if you add tiers.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Pull subscriptions we consider “active/paid”
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .in('status', ['active', 'paid', 'trialing']);

    if (error) {
      console.error('subscriptions-admin error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    const PRICE_MAP = {
      'Basic Signals': 29.99,
    };

    // normalize and compute MRR
    let totalMRR = 0;
    const subs = (data || []).map((row) => {
      const amt = PRICE_MAP[row.plan_type] || 0;
      if (row.status === 'active' || row.status === 'paid' || row.status === 'trialing') {
        totalMRR += amt;
      }
      return {
        id: row.id,
        telegram_id: row.telegram_id,
        plan_type: row.plan_type,
        status: row.status,
        current_period_start: row.current_period_start,
        current_period_end: row.current_period_end,
        amount_usd: amt,
      };
    });

    return res.status(200).json({
      ok: true,
      mrr: Number(totalMRR.toFixed(2)),
      subs,
    });
  } catch (e) {
    console.error('subscriptions-admin crash:', e);
    return res.status(500).json({
      ok: false,
      error: e.message || 'internal error',
    });
  }
}
