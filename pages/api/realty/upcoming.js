// pages/api/realty/upcoming.js
//
// Returns upcoming (future or current) paid reservations so you,
// the host, can see who is coming and when.
//
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // "today" in YYYY-MM-DD for filtering
    const todayISO = new Date().toISOString().slice(0, 10);

    // 1. get paid reservations that haven't ended yet
    const { data: reservations, error: resErr } = await supabaseAdmin
      .from('realty_reservations')
      .select(
        `
        id,
        property_id,
        checkin,
        checkout,
        guests,
        guest_name,
        guest_email,
        guest_phone,
        amount_cents,
        currency,
        status
      `
      )
      .eq('status', 'paid')
      // checkout is the last night+1 (guest leaves that morning),
      // we want anything where checkout >= today
      .gte('checkout', todayISO)
      .order('checkin', { ascending: true });

    if (resErr) {
      console.error('[upcoming] reservations error:', resErr.message);
      return res.status(500).json({ error: resErr.message });
    }

    if (!reservations || reservations.length === 0) {
      return res.status(200).json({ ok: true, stays: [] });
    }

    // 2. get unique property_ids so we can attach property names/slugs
    const propIds = [...new Set(reservations.map((r) => r.property_id))];

    const { data: props, error: propErr } = await supabaseAdmin
      .from('properties')
      .select('id, name, slug')
      .in('id', propIds);

    if (propErr) {
      console.error('[upcoming] props error:', propErr.message);
      return res.status(500).json({ error: propErr.message });
    }

    const propMap = {};
    (props || []).forEach((p) => {
      propMap[p.id] = {
        name: p.name,
        slug: p.slug,
      };
    });

    // 3. normalize stays for frontend
    const stays = reservations.map((r) => ({
      id: r.id,
      property_id: r.property_id,
      property_name: propMap[r.property_id]?.name || 'Property',
      property_slug: propMap[r.property_id]?.slug || r.property_id,
      checkin: r.checkin,
      checkout: r.checkout,
      guests: r.guests,
      guest_name: r.guest_name || '—',
      guest_email: r.guest_email || '—',
      guest_phone: r.guest_phone || '—',
      amount: r.amount_cents
        ? (Number(r.amount_cents) / 100).toFixed(2)
        : '0.00',
      currency: r.currency || 'usd',
      status: r.status,
    }));

    return res.status(200).json({ ok: true, stays });
  } catch (e) {
    console.error('[upcoming] crash:', e);
    return res.status(500).json({ error: e.message || 'internal error' });
  }
}
