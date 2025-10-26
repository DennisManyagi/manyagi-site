// pages/api/realty/reservations-admin.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Admin-facing fetch of upcoming / recent reservations.
 *
 * Returns:
 * [
 *   {
 *     id,
 *     property_id,
 *     property_name,
 *     property_slug,
 *     checkin,
 *     checkout,
 *     nights,
 *     guests,
 *     guest_name,
 *     guest_email,
 *     amount_cents,
 *     currency,
 *     status,
 *     notes,
 *     created_at,
 *   },
 *   ...
 * ]
 *
 * NOTE: This assumes only admins can load /admin (which you already enforce),
 * so we're not doing auth checks here. Do not expose this to public UI.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // pull reservations
    const { data: reservations, error: rErr } = await supabaseAdmin
      .from('realty_reservations')
      .select(
        `
        id,
        property_id,
        checkin,
        checkout,
        nights,
        guests,
        guest_name,
        guest_email,
        guest_phone,
        notes,
        amount_cents,
        currency,
        status,
        stripe_session_id,
        created_at
      `
      )
      .order('checkin', { ascending: true });

    if (rErr) {
      console.error('reservations-admin fetch error:', rErr.message);
      return res.status(500).json({ error: rErr.message });
    }

    if (!reservations || reservations.length === 0) {
      return res.status(200).json({ ok: true, items: [] });
    }

    // gather property_ids
    const propIds = Array.from(
      new Set(reservations.map((r) => r.property_id).filter(Boolean))
    );

    // fetch property metadata for name/slug
    const { data: props, error: pErr } = await supabaseAdmin
      .from('properties')
      .select('id, name, slug')
      .in('id', propIds);

    if (pErr) {
      console.error('reservations-admin property join error:', pErr.message);
      return res.status(500).json({ error: pErr.message });
    }

    const propMap = {};
    (props || []).forEach((p) => {
      propMap[p.id] = {
        name: p.name || '(unnamed)',
        slug: p.slug || null,
      };
    });

    // normalize + decorate each reservation we return to the dashboard
    const items = reservations.map((r) => {
      const propInfo = propMap[r.property_id] || {};
      return {
        id: r.id,
        property_id: r.property_id,
        property_name: propInfo.name,
        property_slug: propInfo.slug,
        checkin: r.checkin,
        checkout: r.checkout,
        nights: r.nights,
        guests: r.guests,
        guest_name: r.guest_name,
        guest_email: r.guest_email,
        guest_phone: r.guest_phone,
        notes: r.notes,
        amount_cents: r.amount_cents,
        currency: r.currency || 'usd',
        status: r.status,
        created_at: r.created_at,
      };
    });

    return res.status(200).json({ ok: true, items });
  } catch (e) {
    console.error('reservations-admin crash:', e);
    return res.status(500).json({ error: e.message || 'internal error' });
  }
}
