import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import Hero from '../components/Hero';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

const PLACEHOLDER_IMAGE =
  'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-home.webp';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/posts');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const posts = await res.json();

        const sorted = (posts || []).slice().sort((a, b) => {
          const da = new Date(a.created_at || 0).getTime();
          const db = new Date(b.created_at || 0).getTime();
          return db - da;
        });

        setBlogPosts(sorted);
      } catch (e) {
        console.error('Blog fetch error:', e);
        setErrorMsg('We had trouble loading posts. Showing a starter article.');
        // simple fallback
        setBlogPosts([
          {
            id: 'welcome-manyagi',
            title: 'Welcome to the Manyagi Universe',
            slug: 'welcome-to-manyagi',
            excerpt: 'How Publishing, Tech, Realty, Capital, Media, and Designs connect into one creator engine.',
            created_at: '2025-09-01T00:00:00Z',
            featured_image: PLACEHOLDER_IMAGE,
            category: 'Announcement',
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [featuredPost, otherPosts] = useMemo(() => {
    if (!blogPosts.length) return [null, []];
    return [blogPosts[0], blogPosts.slice(1)];
  }, [blogPosts]);

  return (
    <>
      <Head>
        <title>Manyagi Blog — Insights, Playbooks & Updates</title>
        <meta
          name="description"
          content="Deep dives, playbooks, and updates from the Manyagi universe — Publishing, Tech, Realty, Capital, Media, and more."
        />
      </Head>

      {/* Hero */}
      <Hero
        kicker="Blog"
        title="Creator Engine, In Public"
        lead="Playbooks, breakdowns, and behind-the-scenes notes as we build the Manyagi Empire across publishing, tech, realty, and capital."
        height="h-[420px]"
        carouselImages={[
          'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-home.webp',
        ]}
      >
        <Link
          href="#posts"
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-sm font-semibold"
        >
          Read the Latest
        </Link>
      </Hero>

      {/* Posts */}
      <section id="posts" className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center text-lg opacity-80">Loading blog posts…</div>
        ) : !blogPosts.length ? (
          <div className="text-center text-lg opacity-80">
            No posts yet — first entry coming soon.
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mb-6 rounded border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                {errorMsg}
              </div>
            )}

            {/* Featured post */}
            {featuredPost && (
              <article className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
                <div className="overflow-hidden rounded-2xl shadow-sm bg-black/5">
                  <img
                    src={featuredPost.featured_image || PLACEHOLDER_IMAGE}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-3">
                  {featuredPost.category && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
                      {featuredPost.category}
                    </span>
                  )}
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                    {featuredPost.title}
                  </h1>
                  <p className="text-sm opacity-70">
                    {formatDate(featuredPost.created_at)} • Manyagi Blog
                  </p>
                  <p className="text-base opacity-90">
                    {featuredPost.excerpt ||
                      'A new dispatch from the Manyagi universe — strategy, systems, and story-driven assets.'}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                      Read Article
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* Rest of posts */}
            {otherPosts.length > 0 && (
              <>
                <h2 className="mb-4 text-xl font-semibold">More posts</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {otherPosts.map((post) => (
                    <article
                      key={post.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white/60 shadow-sm backdrop-blur dark:bg-gray-900/60 dark:border-gray-800"
                    >
                      <div className="h-40 w-full overflow-hidden">
                        <img
                          src={post.featured_image || PLACEHOLDER_IMAGE}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4 space-y-2">
                        {post.category && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                            {post.category}
                          </span>
                        )}
                        <h3 className="text-lg font-semibold leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs opacity-70">
                          {formatDate(post.created_at)}
                        </p>
                        <p className="text-sm opacity-90 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="pt-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                          >
                            Read more →
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Newsletter */}
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427852"
          uid="637df68a05"
          title="Subscribe to Blog Updates"
          description="Weekly playbooks and progress logs from the Manyagi build — no spam, just signal."
        />
      </section>

      <Recommender />
    </>
  );
}
