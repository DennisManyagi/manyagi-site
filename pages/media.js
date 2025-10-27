// pages/media.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Recommender from '../components/Recommender';

// helper to pick an image for cards
function pickCardImage(post) {
  return (
    post.thumbnail_url ||
    post.featured_image ||
    (post.metadata && post.metadata.cover_url) ||
    '/placeholder.png'
  );
}

// try to guess if we can embed this media URL (YouTube / etc)
function MediaEmbed({ mediaUrl }) {
  if (!mediaUrl) return null;

  // very simple YouTube detection
  const isYouTube =
    mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be');

  if (isYouTube) {
    // turn a YouTube watch URL into an embed URL if needed
    let embed = mediaUrl;
    if (mediaUrl.includes('watch?v=')) {
      const videoId = mediaUrl.split('watch?v=')[1].split('&')[0];
      embed = `https://www.youtube.com/embed/${videoId}`;
    }
    return (
      <div className="w-full aspect-video bg-black rounded overflow-hidden border border-gray-300 dark:border-gray-700">
        <iframe
          src={embed}
          title="Media Preview"
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    );
  }

  // fallback: just show a link button
  return (
    <a
      href={mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded hover:bg-blue-700 transition"
    >
      View Media
    </a>
  );
}

export default function MediaPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // load posts where division='media' from the API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/posts?division=media');
        const json = await res.json();

        // /api/posts returns an array of published posts with fields:
        // id,title,slug,excerpt,created_at,featured_image,content,status
        // We aren't guaranteed thumbnail_url unless admin set it, so we normalize
        const list = Array.isArray(json)
          ? json.map((p) => ({
              ...p,
              card_img: pickCardImage(p),
              media_type: p.metadata?.media_type || '',
              media_url: p.metadata?.media_url || '',
            }))
          : [];

        setItems(list);
      } catch (err) {
        console.error('media fetch error:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-1.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-2.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-3.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-4.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-5.webp',
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading media...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Manyagi Media — Stories in Motion</title>
        <meta
          name="description"
          content="Playlists, podcasts, reels, and audiobooks from the Manyagi universe."
        />
      </Head>

      <Hero
        kicker="Media"
        title="Stories in Motion"
        lead="Watch, listen, and explore the world through our voice."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link
          href="#library"
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Browse Library
        </Link>
      </Hero>

      {/* MEDIA GRID */}
      <section
        id="library"
        className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {items.length === 0 ? (
          <div className="col-span-full text-center text-lg">
            No media yet. Check back soon.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded shadow border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
            >
              {/* image */}
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <img
                  src={item.card_img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* body */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                  {item.media_type && (
                    <span className="inline-block bg-gray-900 text-white px-2 py-1 rounded uppercase tracking-wide">
                      {item.media_type}
                    </span>
                  )}
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Manyagi Media
                  </span>
                </div>

                <h2 className="text-lg font-bold leading-snug text-gray-900 dark:text-gray-100">
                  {item.title}
                </h2>

                {item.excerpt && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                    {item.excerpt}
                  </p>
                )}

                {/* inline preview if it's something embeddable like YT */}
                {item.media_url && (
                  <div className="mt-2">
                    <MediaEmbed mediaUrl={item.media_url} />
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-2 text-sm">
                  {/* View details page */}
                  <Link
                    className="inline-block text-blue-600 dark:text-blue-400 underline font-semibold"
                    href={`/media/${item.slug}`}
                  >
                    View Details →
                  </Link>

                  {/* direct link to hosted media (if provided) */}
                  {item.media_url && (
                    <a
                      className="inline-block text-gray-700 dark:text-gray-300 text-xs underline"
                      href={item.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Original Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <Recommender />
    </>
  );
}
