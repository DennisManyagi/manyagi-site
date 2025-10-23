// pages/api/realty/quote.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function* dateRangeUTC(startISO, endISO) {
  const d = new Date(startISO + 'T00:00:00Z');
  const end = new Date(endISO + 'T00:00:00Z');
  for (; d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    yield new Date(d);
  }
}
const ymd = (d) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { query } = req;
    const { property_id, checkin, checkout } = req.body || {};
    if (!property_id || !checkin || !checkout) {
      return res.status(400).json({ error: 'property_id, checkin, checkout required (YYYY-MM-DD)' });
    }

    // 1) Load property (base pricing + fees)
    const { data: prop, error: propErr } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .maybeSingle();
    if (propErr) return res.status(500).json({ error: propErr.message });
    if (!prop) return res.status(404).json({ error: 'property not found' });

    const m = prop.metadata || {};
    const pr = m.pricing || {};
    const base = (typeof pr.base === 'number' ? pr.base : null) ?? Number(prop.price || 0);
    const weekend = typeof pr.weekend === 'number' ? pr.weekend : null;
    const cleaningFee = Number(pr.cleaning_fee || 0);
    const taxRate = Number(pr.tax_rate || 0);

    // 2) Load overrides
    const { data: rates } = await supabaseAdmin
      .from('realty_rates')
      .select('*')
      .eq('property_id', property_id);

    // 3) Build a map of nightly price per date
    const nights = [];
    for (const d of dateRangeUTC(checkin, checkout)) {
      const iso = ymd(d);
      // pick highest priority override that covers this date
      const candidates = (rates || []).filter(
        (r) => iso >= r.start_date && iso <= r.end_date
      );
      candidates.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      let nightly = candidates.length ? Number(candidates[0].nightly_rate) : base;

      // optional weekend override if no seasonal override matched
      if (!candidates.length && weekend && [5, 6].includes(d.getUTCDay())) {
        nightly = weekend;
      }

      nights.push({ date: iso, nightly });
    }

    const subtotal = nights.reduce((acc, n) => acc + Number(n.nightly), 0);
    const totalBeforeTax = subtotal + cleaningFee;
    const taxAmt = Math.round((totalBeforeTax * taxRate + Number.EPSILON) * 100) / 100;
    const total = totalBeforeTax + taxAmt;

    res.status(200).json({
      ok: true,
      currency: 'usd',
      nights,
      summary: {
        nights: nights.length,
        base_subtotal: subtotal,
        cleaning_fee: cleaningFee,
        tax_rate: taxRate,
        tax_amount: taxAmt,
        total,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message || 'internal error' });
  }
}