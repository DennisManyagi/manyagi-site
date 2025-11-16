// pages/media.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Recommender from '../components/Recommender';
import SectionIntro from '../components/SectionIntro';
import SubscriptionForm from '../components/SubscriptionForm';

// helper to pick an image for cards (all admin-editable fields)
function pickCardImage(post) {
  return (
    post.thumbnail_url ||
    post.featured_image ||
    post?.metadata?.cover_url ||
    '/placeholder.png'
  );
}

// derive a friendly platform label from URL, unless admin overrides via metadata.platform
function inferPlatform(mediaUrl) {
  if (!mediaUrl) return '';

  const url = mediaUrl.toLowerCase();

  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('spotify.com')) return 'Spotify';
  if (url.includes('soundcloud.com')) return 'SoundCloud';
  if (url.includes('vimeo.com')) return 'Vimeo';
  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('instagram.com')) return 'Instagram';
  return '';
}

// label for the primary CTA based on media_type
function primaryCtaLabel(mediaType) {
  switch ((mediaType || '').toLowerCase()) {
    case 'podcast':
      return 'Open Episode';
    case 'playlist':
      return 'View Playlist';
    case 'reel':
    case 'short':
      return 'Open Reel';
    case 'audiobook':
      return 'Open Audiobook';
    default:
      return 'View Details';
  }
}

// richer embed support: YouTube, Spotify, SoundCloud, Vimeo; fallback = link button
function MediaEmbed({ mediaUrl }) {
  if (!mediaUrl) return null;

  const url = mediaUrl.trim();

  const isYouTube =
    url.includes('youtube.com') || url.includes('youtu.be');
  const isSpotify = url.includes('open.spotify.com');
  const isSoundCloud = url.includes('soundcloud.com');
  const isVimeo = url.includes('vimeo.com');

  // YouTube
  if (isYouTube) {
    let embed = url;
    if (url.includes('watch?v=')) {
      const videoId = url.split('watch?v=')[1].split('&')[0];
      embed = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split(/[?&]/)[0];
      embed = `https://www.youtube.com/embed/${videoId}`;
    }
    return (
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700">
        <iframe
          src={embed}
          title="Media Preview"
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    );
  }

  // Spotify
  if (isSpotify) {
    const embed = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
    return (
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700">
        <iframe
          src={embed}
          title="Spotify Player"
          className="w-full h-full"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      </div>
    );
  }

  // SoundCloud
  if (isSoundCloud) {
    const embed = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
      url
    )}&color=%23ff5500&auto_play=false&show_teaser=true`;
    return (
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700">
        <iframe
          src={embed}
          title="SoundCloud Player"
          className="w-full h-full"
          allow="autoplay"
        />
      </div>
    );
  }

  // Vimeo
  if (isVimeo) {
    let embed = url;
    // basic vimeo.com/123456 to player URL conversion
    const parts = url.split('vimeo.com/');
    if (parts[1]) {
      const id = parts[1].split(/[?&]/)[0];
      embed = `https://player.vimeo.com/video/${id}`;
    }
    return (
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700">
        <iframe
          src={embed}
          title="Vimeo Player"
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    );
  }

  // fallback: just show a link button
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded-full hover:bg-blue-700 transition"
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

        // /api/posts returns an array of published posts: id,title,slug,excerpt,created_at,featured_image,content,status,metadata,...
        const list = Array.isArray(json)
          ? json.map((p) => {
              const metadata = p.metadata || {};
              const media_url = metadata.media_url || '';
              const media_type = metadata.media_type || '';
              const duration = metadata.duration || ''; // admin-editable via metadata JSON
              const platform =
                metadata.platform || inferPlatform(media_url);
              const primaryBook =
                metadata.book || metadata.series || '';

              return {
                ...p,
                card_img: pickCardImage(p),
                media_type,
                media_url,
                duration,
                platform,
                primaryBook,
              };
            })
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

      {/* HERO */}
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

      {/* SECTION INTRO */}
      <SectionIntro
        id="media-intro"
        kicker="Featured Media"
        title="Watch, Listen, Replay"
        lead="Trailers, reels, live reads, and playlists that extend the Manyagi Universe beyond the page. Start anywhere and fall into the story."
        tone="warm"
      />

      {/* MEDIA LIBRARY */}
      <section
        id="library"
        className="container mx-auto px-4 pt-10 pb-16"
      >
        {items.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <p className="text-lg font-semibold mb-2">
              No media has gone live… yet.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 max-w-xl mx-auto">
              We&apos;re editing trailers, reels, and episodes behind
              the scenes. Check back soon or subscribe below to be the
              first to know when the first drop lands.
            </p>
            <Link
              href="#subscribe"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition"
            >
              Get Release Alerts
            </Link>
          </div>
        ) : (
          <>
            {/* Media Snapshot pill */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl bg-white/80 border border-amber-200/70 shadow-sm text-sm text-gray-700 text-center dark:bg-gray-900/70 dark:border-amber-800/60 dark:text-gray-100">
                <span className="text-[11px] font-semibold tracking-[0.26em] uppercase text-amber-700/80 dark:text-amber-300/80">
                  Media Snapshot
                </span>
                <span>
                  Showing{' '}
                  <span className="font-semibold">
                    {items.length}
                  </span>{' '}
                  {items.length === 1 ? 'entry' : 'entries'} from Manyagi
                  Media.
                </span>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {items.map((item) => {
                const createdLabel = item.created_at
                  ? new Date(item.created_at).toLocaleDateString(
                      undefined,
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )
                  : '';

                const ctaLabel = primaryCtaLabel(item.media_type);

                return (
                  <article
                    key={item.id}
                    className="bg-white/95 dark:bg-gray-900/80 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/80 flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    {/* image */}
                    <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <img
                        src={item.card_img}
                        alt={item.title}
                        className="w-full h-full object-cover transform hover:scale-[1.03] transition duration-300"
                      />
                      {item.media_type && (
                        <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-wide bg-black/70 text-white px-2 py-1 rounded-full">
                          {item.media_type}
                        </span>
                      )}
                    </div>

                    {/* body */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      {/* chips */}
                      <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                        <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Manyagi Media
                        </span>
                        {item.platform && (
                          <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {item.platform}
                          </span>
                        )}
                        {item.duration && (
                          <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {item.duration}
                          </span>
                        )}
                        {createdLabel && (
                          <span className="inline-block text-gray-500 font-normal">
                            {createdLabel}
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold leading-snug text-gray-900 dark:text-gray-100">
                        {item.title}
                      </h2>

                      {item.primaryBook && (
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          From{' '}
                          <span className="font-semibold">
                            {item.primaryBook}
                          </span>
                        </p>
                      )}

                      {item.excerpt && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                          {item.excerpt}
                        </p>
                      )}

                      {/* inline preview if it's embeddable */}
                      {item.media_url && (
                        <div className="mt-2">
                          <MediaEmbed mediaUrl={item.media_url} />
                        </div>
                      )}

                      <div className="mt-auto flex flex-col gap-2 text-sm pt-2">
                        {/* View details page */}
                        <Link
                          className="inline-block text-blue-600 dark:text-blue-400 underline font-semibold"
                          href={`/media/${item.slug}`}
                        >
                          {ctaLabel} →
                        </Link>

                        {/* direct link to hosted media (if provided) */}
                        {item.media_url && (
                          <a
                            className="inline-block text-gray-700 dark:text-gray-300 text-xs underline"
                            href={item.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.platform
                              ? `Open on ${item.platform}`
                              : 'Open Original Source'}
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* SUBSCRIBE FOR MEDIA DROPS */}
      <section
        id="subscribe"
        className="container mx-auto px-4 pb-16"
      >
        <SubscriptionForm
          formId="8427848"
          uid="637df68a01"
          title="Get New Media Drops"
          description="Be the first to know when new trailers, playlists, readings, and episodes go live from the Manyagi Universe."
        />
      </section>

      {/* GLOBAL RECOMMENDER (cross-division) */}
      <Recommender />
    </>
  );
}
