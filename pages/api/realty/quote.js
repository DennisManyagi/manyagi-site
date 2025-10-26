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
 * Build nightly pricing and enforce seasonal overrides.
 *
 * NEW: We now also calculate the min night requirement for the stay,
 * using the max() of any applicable min_nights for those dates.
 *
 * Returns { ok, nights[], summary{...}, min_nights_required, meets_min_stay, currency }
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

  // Track required min_nights across the stay
  // We'll take the max requirement across all nights in the quote.
  let requiredMinNights = 1; // default fallback
  const nights = [];

  for (const d of dateRangeUTC(checkin, checkout)) {
    const iso = ymd(d);

    // all override rows that cover this date
    const candidates = (rates || []).filter(
      (r) => iso >= r.start_date && iso <= r.end_date
    );

    // choose the top candidate by priority, then fallback to base
    candidates.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    let nightly = candidates.length
      ? Number(candidates[0].nightly_rate)
      : base;

    // weekend logic if no seasonal override
    if (!candidates.length && weekend && [5, 6].includes(d.getUTCDay())) {
      nightly = weekend;
    }

    // ADDED:
    // pull min_nights from the chosen candidate and update requiredMinNights
    if (candidates.length) {
      const minN = candidates[0].min_nights
        ? Number(candidates[0].min_nights)
        : null;
      if (minN && minN > requiredMinNights) {
        requiredMinNights = minN;
      }
    }

    nights.push({ date: iso, nightly });
  }

  // money math
  const subtotal = nights.reduce((acc, n) => acc + Number(n.nightly), 0);
  const totalBeforeTax = subtotal + cleaningFee;
  const taxAmt =
    Math.round((totalBeforeTax * taxRate + Number.EPSILON) * 100) / 100;
  const total = totalBeforeTax + taxAmt;

  const stayLength = nights.length;

  // ADDED:
  // If no seasonal override enforced anything, we still might want a global min
  // For example, you might set metadata.pricing.min_nights = 2 in property.metadata.pricing
  const globalMinNights =
    typeof pr.min_nights === 'number' ? pr.min_nights : null;

  if (globalMinNights && globalMinNights > requiredMinNights) {
    requiredMinNights = globalMinNights;
  }

  // ADDED:
  const meetsMinStay = stayLength >= requiredMinNights;

  return {
    ok: true,
    currency: 'usd',
    nights,
    summary: {
      nights: stayLength,
      base_subtotal: subtotal,
      cleaning_fee: cleaningFee,
      tax_rate: taxRate,
      tax_amount: taxAmt,
      total,
    },
    // ADDED:
    min_nights_required: requiredMinNights,
    meets_min_stay: meetsMinStay,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST')
      return res.status(405).json({ error: 'Method not allowed' });

    const { property_id, checkin, checkout } = req.body || {};

    if (!property_id || !checkin || !checkout) {
      return res.status(400).json({
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
      return res
        .status(500)
        .json({ error: quote.error || 'quote failed' });
    }

    return res.status(200).json(quote);
  } catch (e) {
    console.error('quote handler crash:', e);
    res
      .status(500)
      .json({ error: e.message || 'internal error' });
  }
}
