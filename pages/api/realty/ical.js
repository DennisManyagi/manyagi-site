// pages/api/realty/ical.js
export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('missing url');
    const r = await fetch(url);
    if (!r.ok) return res.status(502).send('ical fetch failed');
    const text = await r.text();
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    return res.status(200).send(text);
  } catch (e) {
    return res.status(500).send('error');
  }
}