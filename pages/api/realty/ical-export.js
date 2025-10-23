// pages/api/realty/ical-export.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const fmt = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${y}${m}${day}T${hh}${mm}${ss}Z`;
};

// Return VEVENT for a date range (all-day style, DTEND exclusive)
const vevent = ({ uid, start, end, summary }) => {
  const dtstamp = fmt(new Date());
  const dtstart = `${start.getUTCFullYear()}${String(start.getUTCMonth() + 1).padStart(2, '0')}${String(start.getUTCDate()).padStart(2, '0')}`;
  const dtend = `${end.getUTCFullYear()}${String(end.getUTCMonth() + 1).padStart(2, '0')}${String(end.getUTCDate()).padStart(2, '0')}`;
  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${summary || 'Reserved'}`,
    'TRANSP:OPAQUE',
    'END:VEVENT',
  ].join('\r\n');
};

export default async function handler(req, res) {
  try {
    const { property_id } = req.query || {};
    if (!property_id) {
      res.statusCode = 400;
      return res.end('Missing property_id');
    }

    // Property (for title)
    const { data: prop } = await supabaseAdmin
      .from('properties')
      .select('id,name')
      .eq('id', property_id)
      .maybeSingle();

    // Paid reservations
    const { data: paid } = await supabaseAdmin
      .from('realty_reservations')
      .select('id, checkin, checkout, status')
      .eq('property_id', property_id)
      .eq('status', 'paid');

    // External blocks
    const { data: blocks } = await supabaseAdmin
      .from('realty_external_blocks')
      .select('id, starts_on, ends_on, source')
      .eq('property_id', property_id);

    const events = [];

    (paid || []).forEach((r) => {
      const ci = new Date(r.checkin);
      const co = new Date(r.checkout); // checkout is exclusive
      events.push(
        vevent({
          uid: `${r.id}@manyagi`,
          start: ci,
          end: co,
          summary: `${prop?.name || 'Property'} — Reserved`,
        })
      );
    });

    (blocks || []).forEach((b) => {
      const s = new Date(b.starts_on + 'T00:00:00Z');
      const e = new Date(b.ends_on + 'T00:00:00Z');
      // Make DTEND exclusive
      const eExclusive = new Date(e);
      eExclusive.setUTCDate(eExclusive.getUTCDate() + 1);
      events.push(
        vevent({
          uid: `${b.id}@manyagi-block`,
          start: s,
          end: eExclusive,
          summary: `${prop?.name || 'Property'} — ${b.source || 'External Block'}`,
        })
      );
    });

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//Manyagi Realty//Booking Calendar//EN`,
      `X-WR-CALNAME:${(prop?.name || 'Property') + ' — Manyagi'}`,
      ...events,
      'END:VCALENDAR',
      '',
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="manyagi-${property_id}.ics"`);
    return res.status(200).send(ics);
  } catch (e) {
    return res.status(500).send('ICS error: ' + e.message);
  }
}