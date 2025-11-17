// pages/blog.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
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

function formatDivision(div) {
  if (!div) return 'Manyagi';
  return div.charAt(0).toUpperCase() + div.slice(1);
}

// Be defensive about the API shape: support {ok,items}, plain array, etc.
function normalizePosts(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.items)) return json.items;
  if (json && Array.isArray(json.data)) return json.data;
  return [];
}

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeDivision, setActiveDivision] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/posts');
        const json = await res.json();

        if (!res.ok || json.error) {
          throw new Error(json.error || `HTTP ${res.status}`);
        }

        const posts = normalizePosts(json);

        const sorted = (posts || []).slice().sort((a, b) => {
          const da = new Date(a.created_at || 0).getTime();
          const db = new Date(b.created_at || 0).getTime();
          return db - da;
        });

        setBlogPosts(sorted);
      } catch (e) {
        console.error('Blog fetch error:', e);
        setErrorMsg(
          'We had trouble loading posts. Showing a starter article.'
        );

        // Fallback starter article
        setBlogPosts([
          {
            id: 'welcome-manyagi',
            title: 'Welcome to the Manyagi Universe',
            slug: 'site-welcome-to-the-manyagi-universe',
            excerpt:
              'How Publishing, Tech, Realty, Capital, Media, and Designs connect into one creator engine.',
            created_at: '2025-09-01T00:00:00Z',
            featured_image: PLACEHOLDER_IMAGE,
            division: 'site',
            category: 'Announcement',
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // derive available divisions for filter pills
  const divisionOptions = useMemo(() => {
    const set = new Set();
    (blogPosts || []).forEach((p) => {
      if (p.division) set.add(p.division);
    });
    return ['all', ...Array.from(set)];
  }, [blogPosts]);

  // filter + search
  const filteredPosts = useMemo(() => {
    let items = blogPosts;

    if (activeDivision !== 'all') {
      items = items.filter((p) => (p.division || 'site') === activeDivision);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.excerpt || '').toLowerCase().includes(q) ||
          (p.slug || '').toLowerCase().includes(q)
      );
    }

    return items;
  }, [blogPosts, activeDivision, search]);

  const [featuredPost, otherPosts] = useMemo(() => {
    if (!filteredPosts.length) return [null, []];
    return [filteredPosts[0], filteredPosts.slice(1)];
  }, [filteredPosts]);

  return (
    <>
      <Head>
        <title>Manyagi Blog — Insights, Playbooks & Updates</title>
        <meta
          name="description"
          content="Deep dives, playbooks, and updates from the Manyagi universe — Publishing, Tech, Realty, Capital, Media, and more."
        />
      </Head>

      {/* Top header – clean, editorial */}
      <header className="border-b border-gray-100 bg-white/70 backdrop-blur dark:bg-gray-900/80 dark:border-gray-800">
        <div className="container mx-auto px-4 py-10">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600">
            Manyagi Blog
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
            Creator engine, in public.
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base opacity-80">
            Build logs, playbooks, and behind-the-scenes notes as we grow
            Publishing, Tech, Realty, Capital, Media, and Designs under one
            universe.
          </p>
        </div>
      </header>

      {/* Filters + search */}
      <section className="container mx-auto px-4 pt-8">
        {errorMsg && (
          <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-xs md:text-sm text-yellow-800">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Division pills */}
          <div className="flex flex-wrap gap-2">
            {divisionOptions.map((div) => (
              <button
                key={div}
                type="button"
                onClick={() => setActiveDivision(div)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  activeDivision === div
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-700 dark:bg-gray-900 dark:border-gray-700'
                }`}
              >
                {div === 'all' ? 'All divisions' : formatDivision(div)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full md:w-72">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700"
            />
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="py-16 text-center text-lg opacity-80">
            Loading blog posts…
          </div>
        ) : !filteredPosts.length ? (
          <div className="py-16 text-center text-lg opacity-80">
            No posts yet — first entry coming soon.
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featuredPost && (
              <article className="mb-12 grid grid-cols-1 items-stretch gap-6 rounded-3xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-gray-900/70 dark:border-gray-800 md:grid-cols-2 md:p-6">
                <div className="overflow-hidden rounded-2xl bg-black/5">
                  <img
                    src={featuredPost.featured_image || PLACEHOLDER_IMAGE}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-3 md:space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {featuredPost.category && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                        {featuredPost.category}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-gray-700 dark:bg-gray-800 dark:text-gray-100">
                      {formatDivision(featuredPost.division)}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-semibold leading-tight">
                    {featuredPost.title}
                  </h2>

                  <p className="text-xs md:text-sm opacity-70">
                    {formatDate(featuredPost.created_at)} • Manyagi Blog
                  </p>

                  <p className="text-sm md:text-base opacity-90">
                    {featuredPost.excerpt ||
                      'A new dispatch from the Manyagi universe — strategy, systems, and story-driven assets.'}
                  </p>

                  <div className="pt-1">
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                      Read article
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* Rest of posts */}
            {otherPosts.length > 0 && (
              <>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Recent posts
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {otherPosts.map((post) => (
                    <article
                      key={post.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900/70 dark:border-gray-800"
                    >
                      <div className="h-40 w-full overflow-hidden">
                        <img
                          src={post.featured_image || PLACEHOLDER_IMAGE}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-100">
                            {formatDivision(post.division || 'site')}
                          </span>
                          <span className="opacity-70">
                            {formatDate(post.created_at)}
                          </span>
                        </div>

                        <h3 className="text-base md:text-lg font-semibold leading-snug line-clamp-2">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-sm opacity-80 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}

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
      </main>

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
