// pages/api/realty/calendar-blocks.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Returns merged "unavailable" ranges for a property.
 *
 * Output:
 * {
 *   ok: true,
 *   blocks: [
 *     {
 *       start: '2025-11-26', // YYYY-MM-DD inclusive
 *       end:   '2025-11-30', // YYYY-MM-DD inclusive
 *       label: 'Booked' | 'External Block',
 *       kind:  'reservation' | 'external'
 *     }
 *   ]
 * }
 *
 * NOTE:
 * - Reservations: checkout is exclusive in DB, so we subtract 1 day
 *   and report that as inclusive `end`.
 * - External blocks: already inclusive starts_on..ends_on.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });

  const { property_id } = req.query || {};
  if (!property_id) {
    return res.status(400).json({ error: 'property_id required' });
  }

  try {
    // --- paid reservations ---
    const { data: reservations, error: resErr } = await supabaseAdmin
      .from('realty_reservations')
      .select('checkin, checkout, status')
      .eq('property_id', property_id)
      .eq('status', 'paid');

    if (resErr) {
      console.error('calendar-blocks reservations err', resErr.message);
    }

    // --- external blocks (Airbnb/VRBO etc synced) ---
    const { data: blocks, error: blkErr } = await supabaseAdmin
      .from('realty_external_blocks')
      .select('starts_on, ends_on, source')
      .eq('property_id', property_id);

    if (blkErr) {
      console.error('calendar-blocks blocks err', blkErr.message);
    }

    const out = [];

    // Reservations:
    // DB has checkin (inclusive) -> checkout (exclusive).
    // We'll make `end` = checkout-1day so UI can highlight those nights.
    (reservations || []).forEach((r) => {
      const start = r.checkin; // 'YYYY-MM-DD'
      const checkoutDate = new Date(r.checkout + 'T00:00:00Z');
      checkoutDate.setUTCDate(checkoutDate.getUTCDate() - 1);
      const end_display = checkoutDate.toISOString().slice(0, 10);

      out.push({
        start,
        end: end_display,
        label: 'Booked',
        kind: 'reservation',
      });
    });

    // External blocks are already inclusive
    (blocks || []).forEach((b) => {
      out.push({
        start: b.starts_on,
        end: b.ends_on,
        label: 'External Block',
        kind: 'external',
      });
    });

    return res.status(200).json({ ok: true, blocks: out });
  } catch (e) {
    console.error('calendar-blocks crash', e);
    return res
      .status(500)
      .json({ ok: false, error: e.message || 'internal error', blocks: [] });
  }
}
