// pages/api/realty/quote.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// helper: iterate nights from checkin (inclusive) to checkout (exclusive)
function* dateRangeUTC(startISO, endISO) {
  const d = new Date(startISO + 'T00:00:00Z');
  const end = new Date(endISO + 'T00:00:00Z');
  for (; d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    yield new Date(d);
  }
}

// helper: format YYYY-MM-DD in UTC
const ymd = (d) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate()
  ).padStart(2, '0')}`;

/**
 * Core quote calculator that BOTH /quote and /create-checkout use.
 * Inputs:
 *   propRow: row from `properties`
 *   rates: rows from `realty_rates` for that property
 *   checkin, checkout: 'YYYY-MM-DD'
 *
 * Returns { ok, nights[], summary{...}, currency }
 */
export function calculateQuote({ propRow, rates, checkin, checkout }) {
  if (!propRow) {
    return { ok: false, error: 'missing property' };
  }

  const m = propRow.metadata || {};
  const pr = m.pricing || {};

  // base nightly, weekend override, fees/taxes
  const base =
    (typeof pr.base === 'number' ? pr.base : null) ?? Number(propRow.price || 0);
  const weekend = typeof pr.weekend === 'number' ? pr.weekend : null;
  const cleaningFee = Number(pr.cleaning_fee || 0);
  const taxRate = Number(pr.tax_rate || 0);

  // Build a map of nightly prices for each night
  const nights = [];
  for (const d of dateRangeUTC(checkin, checkout)) {
    const iso = ymd(d);

    // seasonal overrides that include this date
    const candidates = (rates || []).filter(
      (r) => iso >= r.start_date && iso <= r.end_date
    );

    // pick highest priority
    candidates.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    let nightly = candidates.length
      ? Number(candidates[0].nightly_rate)
      : base;

    // weekend logic if no seasonal override
    if (!candidates.length && weekend && [5, 6].includes(d.getUTCDay())) {
      nightly = weekend;
    }

    nights.push({ date: iso, nightly });
  }

  // money math
  const subtotal = nights.reduce((acc, n) => acc + Number(n.nightly), 0);
  const totalBeforeTax = subtotal + cleaningFee;
  const taxAmt = Math.round((totalBeforeTax * taxRate + Number.EPSILON) * 100) / 100;
  const total = totalBeforeTax + taxAmt;

  return {
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
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST')
      return res.status(405).json({ error: 'Method not allowed' });

    const { property_id, checkin, checkout } = req.body || {};

    if (!property_id || !checkin || !checkout) {
      return res
        .status(400)
        .json({
          error:
            'property_id, checkin, checkout required (YYYY-MM-DD)',
        });
    }

    // Load property
    const { data: propRow, error: propErr } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .maybeSingle();

    if (propErr)
      return res.status(500).json({ error: propErr.message });
    if (!propRow)
      return res.status(404).json({ error: 'property not found' });

    // Load seasonal / override rates
    const { data: rateRows, error: rateErr } = await supabaseAdmin
      .from('realty_rates')
      .select('*')
      .eq('property_id', property_id);

    if (rateErr)
      return res.status(500).json({ error: rateErr.message });

    const quote = calculateQuote({
      propRow,
      rates: rateRows || [],
      checkin,
      checkout,
    });

    if (!quote.ok) {
      return res.status(500).json({ error: quote.error || 'quote failed' });
    }

    return res.status(200).json(quote);
  } catch (e) {
    console.error('quote handler crash:', e);
    res.status(500).json({ error: e.message || 'internal error' });
  }
}
