// pages/api/realty/property.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function sendJSON(res, status, payload) {
  res.status(status).json(payload);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJSON(res, 405, { error: 'Method not allowed' });
  }

  const { slug, all } = req.query;

  try {
    //
    // LIST MODE: /api/realty/property?all=1
    //
    if (all) {
      const { data, error } = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('division', 'realty')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('properties list error', error);
        return sendJSON(res, 500, { error: error.message });
      }

      const properties = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || '',
        nightly_price: Number(p.price || 0),
        image_url:
          (p.metadata && p.metadata.cover_url) ||
          (p.metadata && p.metadata.hero_url) ||
          '',
        metadata: p.metadata || {},
        created_at: p.created_at,
      }));

      return sendJSON(res, 200, { ok: true, properties });
    }

    //
    // DETAIL MODE: /api/realty/property?slug=...
    //
    if (!slug) {
      return sendJSON(res, 400, { error: 'slug required' });
    }

    const { data: rows, error: propErr } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .limit(1);

    if (propErr) {
      console.error('property fetch error', propErr);
      return sendJSON(res, 500, { error: propErr.message });
    }

    const prop = rows && rows[0];
    if (!prop) {
      return sendJSON(res, 404, { error: 'Property not found' });
    }

    // pull gallery_urls array off metadata if present
    const gallery_urls = Array.isArray(prop.metadata?.gallery_urls)
      ? prop.metadata.gallery_urls
      : [];

    // normalize the property for frontend
    const property = {
      id: prop.id,
      name: prop.name,
      slug: prop.slug,
      description: prop.description || '',
      nightly_price: Number(prop.price || 0),
      image_url:
        (prop.metadata && prop.metadata.cover_url) ||
        (prop.metadata && prop.metadata.hero_url) ||
        '',
      metadata: prop.metadata || {},
      gallery_urls, // <-- NEW
    };

    // availability (optional table)
    let availability = [];
    try {
      const { data: availRows, error: aErr } = await supabaseAdmin
        .from('property_availability')
        .select('*')
        .eq('property_id', prop.id)
        .order('date');

      if (aErr) {
        console.warn('availability lookup error (non-fatal)', aErr.message);
      } else {
        availability = availRows || [];
      }
    } catch (innerErr) {
      console.warn('availability lookup threw (non-fatal)', innerErr);
    }

    return sendJSON(res, 200, { ok: true, property, availability });
  } catch (err) {
    console.error('unhandled property api error', err);
    return sendJSON(res, 500, { error: 'Server error' });
  }
}
