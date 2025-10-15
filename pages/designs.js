// pages/designs.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

const PAGE_SIZE = 16; // grid pagination

export default function Designs() {
  const router = useRouter();
  const dispatch = useDispatch();

  // UI state
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // filters (source of truth = URL query so you can link to collections)
  const initial = useMemo(() => ({
    q: (router.query.q || '').toString(),
    collection: (router.query.collection || '').toString(), // e.g. "LOHC" or "prompt-1" etc.
    tag: (router.query.tag || '').toString(),
    sort: (router.query.sort || 'new').toString(), // 'new' | 'price_asc' | 'price_desc'
  }), [router.query]);

  const [q, setQ] = useState(initial.q);
  const [collection, setCollection] = useState(initial.collection);
  const [tag, setTag] = useState(initial.tag);
  const [sort, setSort] = useState(initial.sort);

  // derived
  const canLoadMore = items.length < total;

  // carousel (you can later populate from site_config if you like)
  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-1.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-2.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-3.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-4.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-5.webp',
  ];

  // Fetch products
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

    const url = `/api/products?${params.toString()}`;

    try {
      if (offset === 0) setLoading(true);
      else setFetchingMore(true);

      const res = await fetch(url);
      const data = await res.json();
      const nextItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

      setItems(prev => append ? [...prev, ...nextItems] : nextItems);
      setTotal(Number(data?.total ?? nextItems.length));
    } catch (e) {
      console.error('Designs fetch error:', e);
      // Fallback sample
      if (offset === 0) {
        const sample = [
          {
            id: 'fallback-tee',
            name: 'Sample T-Shirt',
            price: 29.99,
            display_image: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp',
            thumbnail_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp',
            image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp',
            division: 'designs',
            description: 'Fallback design merchandise',
            printful_product_id: 'fallback-tee-id',
            productType: 'merch',
            metadata: { prompt: 1, book: 'Sample', scene: 'Portal' },
            tags: ['sample', 'tee'],
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

  // Run on first load + whenever URL query changes (back/forward support)
  useEffect(() => {
    setQ(initial.q);
    setCollection(initial.collection);
    setTag(initial.tag);
    setSort(initial.sort || 'new');
    fetchProducts({ offset: 0, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.q, initial.collection, initial.tag, initial.sort]);

  // Push current filters to URL (so you can share a filtered link)
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

  // “Collections” and “Tags” suggestions from current items (so the picker is never empty)
  const collectionOptions = useMemo(() => {
    const set = new Set();
    items.forEach(p => {
      // collections come from product.metadata like book, series, drop, year, prompt
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
    items.forEach(p => (p?.tags || []).forEach(t => set.add(t)));
    return Array.from(set);
  }, [items]);

  // Add to cart
  const handleAddToCart = (product) => {
    dispatch(addToCart({
      ...product,
      productType: 'merch',
      printful_product_id: product.printful_product_id,
      metadata: product.metadata || {},
    }));
    setShowModal(true);
    setTimeout(() => setShowModal(false), 1600);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading designs…
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Manyagi Designs — Wear Your Story</title>
        <meta name="description" content="Explore T-shirts, mugs, and prints inspired by our stories." />
      </Head>

      <Hero
        kicker="Designs"
        title="Wear Your Story"
        lead="Shop T-shirts, mugs, posters, and more inspired by our narratives."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#products" className="btn bg-blue-600 text-white py-3 px-5 rounded hover:scale-105 transition">
          Shop Now
        </Link>
      </Hero>

      {/* Filter Bar */}
      <section className="container mx-auto px-4 mt-8">
        <form onSubmit={applyFilters} className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, scene, book…"
              className="w-full border rounded px-3 py-2 dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Collection</label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="border rounded px-3 py-2 w-48 dark:bg-gray-900"
            >
              <option value="">All</option>
              {collectionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tag</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="border rounded px-3 py-2 w-48 dark:bg-gray-900"
            >
              <option value="">All</option>
              {tagOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded px-3 py-2 w-40 dark:bg-gray-900"
            >
              <option value="new">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Apply</button>
            <button type="button" onClick={clearFilters} className="px-4 py-2 bg-gray-200 rounded dark:bg-gray-800">
              Clear
            </button>
          </div>
        </form>
      </section>

      {/* Products Grid */}
      <section id="products" className="container mx-auto px-4 py-10">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg">No products found for your filters.</p>
            <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
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
                  description={product.description}
                  image={product.display_image}
                  category="designs"
                  buyButton={product}
                  onBuy={() => handleAddToCart(product)}
                >
                  {/* Small badges row */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product?.metadata?.book && (
                      <span className="text-xs bg-gray-200 rounded px-2 py-0.5 dark:bg-gray-800">
                        {product.metadata.book}
                      </span>
                    )}
                    {Array.isArray(product?.tags) &&
                      product.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs bg-gray-200 rounded px-2 py-0.5 dark:bg-gray-800">
                          {t}
                        </span>
                      ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Load more */}
            {canLoadMore && (
              <div className="text-center mt-10">
                <button
                  disabled={fetchingMore}
                  onClick={loadMore}
                  className="px-5 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  {fetchingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section id="subscribe" className="container mx-auto px-4 pb-16">
        <SubscriptionForm
          formId="8432506"
          uid="a194031db7"
          title="Stay Updated on New Designs"
          description="Get notified about new drops and exclusive offers."
        />
      </section>

      {/* Mini “added to cart” toast */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center dark:bg-gray-900">
            <p className="text-base">Added to cart!</p>
            <Link href="/cart" className="text-blue-600 hover:underline mt-4 inline-block">
              View Cart
            </Link>
          </div>
        </div>
      )}

      <Recommender />
    </>
  );
}
