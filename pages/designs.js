// pages/designs.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SectionIntro from '../components/SectionIntro';

const PAGE_SIZE = 16;

// Prefer higher-quality image fields when available
function pickImage(p) {
  return (
    (p?.thumbnail_url &&
      typeof p.thumbnail_url === 'string' &&
      p.thumbnail_url) ||
    (p?.display_image &&
      typeof p.display_image === 'string' &&
      p.display_image) ||
    (p?.image_url && typeof p.image_url === 'string' && p.image_url) ||
    (p?.image && typeof p.image === 'string' && p.image) ||
    '/placeholder.png' // CSP-safe local fallback
  );
}

export default function Designs() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const initial = useMemo(
    () => ({
      q: (router.query.q || '').toString(),
      collection: (router.query.collection || '').toString(),
      tag: (router.query.tag || '').toString(),
      sort: (router.query.sort || 'new').toString(),
    }),
    [router.query]
  );

  const [q, setQ] = useState(initial.q);
  const [collection, setCollection] = useState(initial.collection);
  const [tag, setTag] = useState(initial.tag);
  const [sort, setSort] = useState(initial.sort);

  const canLoadMore = items.length < total;

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-1.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-2.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-3.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-4.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-5.webp',
  ];

  const fetchProducts = async ({ offset = 0, append = false } = {}) => {
    const params = new URLSearchParams({
      division: 'designs',
      limit: String(PAGE_SIZE),
      offset: String(offset),
      sort: sort || 'new',
    });
    if (q) params.set('q', q);
    if (collection) params.set('collection', collection);
    if (tag) params.set('tag', tag);

    try {
      if (offset === 0) setLoading(true);
      else setFetchingMore(true);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      const nextItemsRaw = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];

      // Normalize the image field so cards never break
      const nextItems = nextItemsRaw.map((p) => ({
        ...p,
        display_image: pickImage(p),
      }));

      setItems((prev) => (append ? [...prev, ...nextItems] : nextItems));
      setTotal(Number(data?.total ?? nextItems.length));
    } catch (e) {
      console.error('Designs fetch error:', e);
      if (offset === 0) {
        const sample = [
          {
            id: 'fallback-tee',
            name: 'Sample T-Shirt',
            price: 29.99,
            display_image:
              'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp',
            division: 'designs',
            description:
              'Fallback design merchandise. Made with 100% cotton for comfort.',
            printful_product_id: 'fallback-tee-id',
            productType: 'merch',
            metadata: { book: 'Sample', prompt: 1 },
          },
        ];
        setItems(sample);
        setTotal(sample.length);
      }
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    setQ(initial.q);
    setCollection(initial.collection);
    setTag(initial.tag);
    setSort(initial.sort || 'new');
    fetchProducts({ offset: 0, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.q, initial.collection, initial.tag, initial.sort]);

  const applyFilters = (e) => {
    e?.preventDefault?.();
    const params = new URLSearchParams();
    params.set('division', 'designs');
    if (q) params.set('q', q);
    if (collection) params.set('collection', collection);
    if (tag) params.set('tag', tag);
    if (sort) params.set('sort', sort);
    router.push(`/designs?${params.toString()}`, undefined, { shallow: true });
  };

  const clearFilters = () => {
    setQ('');
    setCollection('');
    setTag('');
    setSort('new');
    router.push('/designs?division=designs', undefined, { shallow: true });
  };

  const loadMore = () => {
    if (!canLoadMore || fetchingMore) return;
    fetchProducts({ offset: items.length, append: true });
  };

  const collectionOptions = useMemo(() => {
    const set = new Set();
    items.forEach((p) => {
      if (p?.metadata?.book) set.add(p.metadata.book);
      if (p?.metadata?.series) set.add(p.metadata.series);
      if (p?.metadata?.drop) set.add(p.metadata.drop);
      if (p?.metadata?.year) set.add(String(p.metadata.year));
      if (p?.metadata?.prompt) set.add(`prompt-${p.metadata.prompt}`);
    });
    return Array.from(set);
  }, [items]);

  const tagOptions = useMemo(() => {
    const set = new Set();
    items.forEach((p) => (p?.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [items]);

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        ...product,
        productType: 'merch',
        printful_product_id: product.printful_product_id,
        metadata: product.metadata || {},
      })
    );
    setShowModal(true);
    setTimeout(() => setShowModal(false), 1600);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading designs…
      </div>
    );
  }

  const filtersActive =
    q || collection || tag || (sort && sort !== 'new');

  return (
    <>
      <Head>
        <title>Manyagi Designs — Premium Apparel & Gear</title>
        <meta
          name="description"
          content="High-quality T-shirts, mugs, and prints inspired by the Manyagi Universe. Exclusive drops, story-linked collections, and premium merch."
        />
      </Head>

      {/* HERO */}
      <Hero
        kicker="Manyagi Designs"
        title="Wear the Universe"
        lead="Story-linked apparel, posters, and gear forged from the worlds of the Manyagi Universe. Designed to feel like limited drops, not generic merch."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link
          href="#products"
          className="btn bg-blue-600 text-white py-3 px-5 rounded hover:scale-105 transition"
        >
          Browse the Collection
        </Link>
      </Hero>

      {/* INTRO TO DESIGNS */}
      <SectionIntro
        id="designs-overview"
        kicker="Merch, But Cinematic"
        title="Designs Made to Feel Like Scenes"
        lead="Each piece is tied to a moment, character, or location from the Manyagi stories—so when you wear it, it feels like a frame pulled from a prestige series."
        tone="warm"
      />

      {/* TRUST BADGES */}
      <section className="container mx-auto px-4 pb-10 -mt-6">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {[
            { label: 'Premium Printful Fulfillment', sub: 'Global, on-demand production' },
            { label: 'Secure Payment', sub: 'Stripe, PayPal & major cards' },
            { label: '30-Day Returns', sub: 'On misprints & damaged items' },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex flex-col items-center px-4 py-3 rounded-2xl bg-white/80 shadow-sm border border-amber-100 text-xs md:text-sm text-gray-700 dark:bg-gray-900/70 dark:border-amber-800/50 dark:text-gray-100"
            >
              <span className="font-semibold">{badge.label}</span>
              <span className="opacity-80">{badge.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="container mx-auto px-4 pt-4">
        <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-amber-100/80 dark:border-gray-800 shadow-sm px-4 md:px-6 py-5 md:py-6">
          <form
            onSubmit={applyFilters}
            className="flex flex-col md:flex-row gap-4 items-stretch md:items-end"
          >
            <div className="flex-1">
              <label className="block text-xs font-semibold tracking-wide uppercase mb-1 text-gray-600 dark:text-gray-300">
                Search
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, scene, book…"
                className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-gray-950 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide uppercase mb-1 text-gray-600 dark:text-gray-300">
                Collection
              </label>
              <select
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="border rounded-xl px-3 py-2 w-40 md:w-48 text-sm dark:bg-gray-950 dark:border-gray-700"
              >
                <option value="">All</option>
                {collectionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide uppercase mb-1 text-gray-600 dark:text-gray-300">
                Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="border rounded-xl px-3 py-2 w-40 md:w-48 text-sm dark:bg-gray-950 dark:border-gray-700"
              >
                <option value="">All</option>
                {tagOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide uppercase mb-1 text-gray-600 dark:text-gray-300">
                Sort
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border rounded-xl px-3 py-2 w-32 md:w-40 text-sm dark:bg-gray-950 dark:border-gray-700"
              >
                <option value="new">Newest</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
              </select>
            </div>
            <div className="flex gap-2 md:gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                Apply
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* SNAPSHOT BAR + PRODUCTS GRID */}
      <section id="products" className="container mx-auto px-4 py-10">
        {/* Snapshot pill */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl bg-white/80 border border-amber-200/70 shadow-sm text-sm text-gray-700 text-center dark:bg-gray-900/70 dark:border-amber-800/60 dark:text-gray-100">
            <span className="text-[11px] font-semibold tracking-[0.26em] uppercase text-amber-700/80 dark:text-amber-300/80">
              Design Gallery
            </span>
            <span>
              Showing{' '}
              <span className="font-semibold">{items.length}</span> of{' '}
              <span className="font-semibold">{total}</span> designs
              {filtersActive && ' in your filtered view.'}
              {!filtersActive && '.'}
            </span>
            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50/70 px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-700/80 dark:bg-amber-900/40 dark:text-amber-50 dark:hover:bg-amber-900/60"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg">No products found for your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((product) => (
                <Card
                  key={product.id}
                  title={product.name}
                  description={`${product.description} Made with premium materials for lasting comfort.`}
                  image={product.display_image}
                  category="designs"
                  buyButton={product}
                  onBuy={() => handleAddToCart(product)}
                />
              ))}
            </div>

            {canLoadMore && (
              <div className="text-center mt-10">
                <button
                  disabled={fetchingMore}
                  onClick={loadMore}
                  className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  {fetchingMore ? 'Loading…' : 'Load more designs'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* SUBSCRIBE */}
      <section id="subscribe" className="container mx-auto px-4 pb-16">
        <SubscriptionForm
          formId="8432506"
          uid="a194031db7"
          title="Stay Updated on New Designs"
          description="Get notified about new drops, limited runs, and exclusive offers from Manyagi Designs."
        />
      </section>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center dark:bg-gray-900">
            <p className="text-base font-medium">Added to cart!</p>
            <Link
              href="/cart"
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              View Cart
            </Link>
          </div>
        </div>
      )}

      {/* GLOBAL RECOMMENDER */}
      <Recommender />
    </>
  );
}
