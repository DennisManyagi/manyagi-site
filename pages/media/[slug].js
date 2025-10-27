// pages/media/[slug].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// helper to pick a hero image
function pickHero(post) {
  return (
    post.featured_image ||
    post.thumbnail_url ||
    (post.metadata && post.metadata.cover_url) ||
    '/placeholder.png'
  );
}

// same embed helper logic as list page
function MediaEmbed({ mediaUrl }) {
  if (!mediaUrl) return null;

  const isYouTube =
    mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be');

  if (isYouTube) {
    let embed = mediaUrl;
    if (mediaUrl.includes('watch?v=')) {
      const videoId = mediaUrl.split('watch?v=')[1].split('&')[0];
      embed = `https://www.youtube.com/embed/${videoId}`;
    }
    return (
      <div className="w-full aspect-video bg-black rounded overflow-hidden border border-gray-300 dark:border-gray-700 mb-6">
        <iframe
          src={embed}
          title="Media Player"
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    );
  }

  // fallback if not YouTube
  return (
    <div className="mb-6">
      <a
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded hover:bg-blue-700 transition"
      >
        Open / Play Media
      </a>
    </div>
  );
}

export default function MediaDetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch single media post by slug
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`/api/posts?division=media&slug=${slug}`);
        const json = await res.json();

        // normalize result
        let row = null;
        if (Array.isArray(json)) {
          row = json[0] || null;
        } else if (json.post) {
          row = json.post;
        } else if (json.items) {
          row = json.items[0] || null;
        }

        setPost(row);
      } catch (err) {
        console.error('media slug fetch error:', err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">Loading…</div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16">
        Media item not found.
      </div>
    );
  }

  const heroImg = pickHero(post);
  const mediaType = post.metadata?.media_type;
  const mediaUrl = post.metadata?.media_url;

  return (
    <>
      <Head>
        <title>{post.title} — Manyagi Media</title>
        <meta
          name="description"
          content={
            post.excerpt || 'Manyagi Media feature'
          }
        />
      </Head>

      <section className="container mx-auto px-4 pb-32 pt-16 md:pb-16 max-w-3xl">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">
          {post.title}
        </h1>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold mb-6">
          {mediaType && (
            <span className="inline-block bg-gray-900 text-white px-2 py-1 rounded uppercase tracking-wide">
              {mediaType}
            </span>
          )}
          <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Manyagi Media
          </span>
        </div>

        {/* Hero image */}
        <div className="w-full h-64 md:h-[360px] rounded overflow-hidden bg-gray-200 mb-6 border border-gray-300 dark:border-gray-700">
          <img
            src={heroImg}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Player / CTA */}
        <MediaEmbed mediaUrl={mediaUrl} />

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-6 text-lg text-gray-800 dark:text-gray-200 whitespace-pre-line">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        {post.content && (
          <article className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-line">
            {post.content}
          </article>
        )}
      </section>
    </>
  );
}
