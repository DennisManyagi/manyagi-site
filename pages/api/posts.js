// pages/api/posts.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/posts
 *
 * Query params:
 *   ?division=tech            -> filter by division
 *   ?slug=daito-app           -> filter by slug (requires division OR will search all divisions)
 *
 * Shapes returned:
 *
 * 1) List mode (no slug):
 *    {
 *      ok: true,
 *      items: [
 *        { id, title, slug, excerpt, created_at, featured_image, content, status, division, metadata }
 *      ],
 *      total: 3
 *    }
 *
 * 2) Detail mode (has slug):
 *    {
 *      ok: true,
 *      post: { id, title, slug, ... }
 *    }
 *
 * Errors:
 *    { ok:false, error:"message" }
 *
 * NOTE:
 * We always .eq('status','published') so drafts won't leak.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { division, slug } = req.query || {};

    // --- DETAIL MODE: division + slug (or just slug) -----------------
    // If we have a slug, we're trying to fetch a single post.
    if (slug) {
      // Build the query
      let q = supabaseAdmin
        .from('posts')
        .select(
          'id,title,slug,excerpt,created_at,featured_image,content,status,division,metadata'
        )
        .eq('status', 'published')
        .eq('slug', slug)
        .limit(1);

      // If division was provided, add that filter too
      if (division) {
        q = q.eq('division', division);
      }

      const { data, error } = await q;
      if (error) {
        console.error('posts detail fetch error:', error);
        return res
          .status(200)
          .json({ ok: false, error: error.message || 'query failed' });
      }

      const post = Array.isArray(data) && data.length > 0 ? data[0] : null;

      if (!post) {
        return res
          .status(200)
          .json({ ok: false, error: 'not found' });
      }

      return res.status(200).json({ ok: true, post });
    }

    // --- LIST MODE: no slug, maybe division --------------------------
    // Build base query for list
    let listQuery = supabaseAdmin
      .from('posts')
      .select(
        'id,title,slug,excerpt,created_at,featured_image,content,status,division,metadata'
      )
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (division) {
      listQuery = listQuery.eq('division', division);
    }

    const { data: rows, error: listErr } = await listQuery;
    if (listErr) {
      console.error('posts list fetch error:', listErr);
      return res
        .status(200)
        .json({ ok: false, error: listErr.message || 'query failed', items: [], total: 0 });
    }

    return res.status(200).json({
      ok: true,
      items: rows || [],
      total: rows ? rows.length : 0,
    });
  } catch (e) {
    console.error('posts handler crash:', e);
    return res
      .status(200)
      .json({ ok: false, error: e.message || 'internal error', items: [], total: 0 });
  }
}
