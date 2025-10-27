// pages/api/events.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Public events feed.
 *
 * Accepts optional query params:
 *   ?division=tech      -> only show events for that division
 *   ?upcoming=1         -> only future events (start_date >= now)
 *
 * Returns: [{ id, title, description, start_date, end_date, division }]
 */
export default async function handler(req, res) {
  try {
    const { division, upcoming } = req.query || {};

    let query = supabaseAdmin
      .from('events')
      .select(
        'id,title,description,start_date,end_date,division,metadata'
      )
      .order('start_date', { ascending: true });

    // filter by division if provided
    if (division) {
      query = query.eq('division', division);
    }

    const { data, error } = await query;
    if (error) throw error;

    // upcoming filter (client can pass upcoming=1)
    let list = data || [];
    if (upcoming) {
      const now = Date.now();
      list = list.filter((ev) => {
        if (!ev.start_date) return false;
        const startTs = new Date(ev.start_date).getTime();
        return startTs >= now;
      });
    }

    return res.status(200).json(list);
  } catch (e) {
    console.error('events api error:', e);
    return res.status(200).json([]);
  }
}
