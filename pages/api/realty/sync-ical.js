// pages/api/realty/sync-ical.js
// Fetch external ICS feeds from property.ical_urls (array of URLs) and upsert blocks
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function parseIcsDate(v) {
  // supports VALUE=DATE (YYYYMMDD) and UTC date-time
  const m = String(v).trim();
  if (/^\\d{8}$/.test(m)) {
    const y = Number(m.slice(0, 4));
    const mm = Number(m.slice(4, 6)) - 1;
    const d = Number(m.slice(6, 8));
    return new Date(Date.UTC(y, mm, d, 0, 0, 0));
  }
  // try basic YYYYMMDDTHHMMSSZ
  const iso = m.replace(
    /^(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})Z$/,
    '$1-$2-$3T$4:$5:$6Z'
  );
  const dt = new Date(iso);
  if (!isNaN(dt)) return dt;
  return null;
}

function extractEvents(icsText) {
  const blocks = icsText.split(/BEGIN:VEVENT/gi).slice(1);
  const events = [];
  blocks.forEach((raw) => {
    const seg = 'BEGIN:VEVENT' + raw;
    const endIdx = seg.indexOf('END:VEVENT');
    const vevent = seg.slice(0, endIdx);
    const lines = vevent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let dtstart, dtend, uid, summary = '';
    lines.forEach((ln) => {
      if (ln.startsWith('UID:')) uid = ln.slice(4);
      if (ln.startsWith('SUMMARY:')) summary = ln.slice(8);
      if (ln.startsWith('DTSTART')) {
        const val = ln.split(':')[1];
        dtstart = parseIcsDate(val);
      }
      if (ln.startsWith('DTEND')) {
        const val = ln.split(':')[1];
        dtend = parseIcsDate(val);
      }
    });
    if (dtstart && dtend) {
      events.push({ uid, summary, dtstart, dtend });
    }
  });
  return events;
}

const ymd = (d) => d.toISOString().slice(0, 10);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { property_id } = req.body || {};
    if (!property_id) return res.status(400).json({ error: 'property_id required' });

    // Load property to get feeds
    const { data: prop, error: pErr } = await supabaseAdmin
      .from('properties')
      .select('id, metadata')
      .eq('id', property_id)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    const feeds = (prop.metadata?.ical_urls || []).filter(Boolean);
    if (!feeds.length) return res.status(200).json({ ok: true, imported: 0, feeds: 0 });

    let imported = 0;

    for (const url of feeds) {
      const r = await fetch(url);
      if (!r.ok) continue;
      const text = await r.text();
      const events = extractEvents(text);

      // Clear previous blocks for this source (optional: keep rolling window)
      await supabaseAdmin
        .from('realty_external_blocks')
        .delete()
        .eq('property_id', property_id)
        .eq('source', url);

      const rows = [];
      for (const ev of events) {
        // many channel feeds use DTEND exclusive; make the inclusive date:
        const dtend = new Date(ev.dtend);
        dtend.setUTCDate(dtend.getUTCDate() - 1);
        rows.push({
          property_id,
          starts_on: ymd(ev.dtstart),
          ends_on: ymd(dtend),
          source: url,
          uid: ev.uid || null,
        });
      }
      if (rows.length) {
        // insert in chunks
        const chunk = 500;
        for (let i = 0; i < rows.length; i += chunk) {
          const slice = rows.slice(i, i + chunk);
          await supabaseAdmin.from('realty_external_blocks').insert(slice);
        }
        imported += rows.length;
      }
    }

    return res.status(200).json({ ok: true, feeds: feeds.length, imported });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}