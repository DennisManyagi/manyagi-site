// pages/designs.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

const PAGE_SIZE = 16;

function pickImage(p) {
  return (
    p?.thumbnail_url ||
    p?.display_image ||
    p?.image_url ||
    p?.image ||
    ''
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

  const initial = useMemo(() => ({
    q: (router.query.q || '').toString(),
    collection: (router.query.collection || '').toString(),
    tag: (router.query.tag || '').toString(),
    sort: (router.query.sort || 'new').toString(),
  }), [router.query]);

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
      const nextItems = nextItemsRaw.map(p => ({
        ...p,
        display_image: pickImage(p),
      }));

      setItems(prev => (append ? [...prev, ...nextItems] : nextItems));
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
            description: 'Fallback design merchandise',
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
    items.forEach(p => {
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
                />
              ))}
            </div>

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
