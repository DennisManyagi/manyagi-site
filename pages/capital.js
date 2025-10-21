// pages/capital.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SignalsSubscriptionForm from '../components/SignalsSubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

// Helpers
const asList = (v) => {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.items)) return v.items;
  return [];
};
const pickImage = (p) =>
  p?.thumbnail_url || p?.display_image || p?.image_url || p?.image || '';

export default function Capital() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products?division=capital');
        const json = await res.json();
        const list = asList(json).map((p) => ({
          ...p,
          display_image: pickImage(p),
          productType: p.productType || 'download',
        }));
        if (list.length === 0) {
          const fallback = [
            {
              id: 'bot1',
              name: 'Trading Bot License',
              price: 99.99,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/bot-license.webp',
              division: 'capital',
              description: 'Lifetime access to premium trading bot, trusted by 100K+ users.',
              productType: 'download',
            },
          ];
          setProducts(fallback);
          setTotal(fallback.length);
        } else {
          setProducts(list);
          setTotal(Number(json?.total ?? list.length));
        }
      } catch (error) {
        console.error('Capital fetch error:', error);
        const fallback = [
          {
            id: 'bot1',
            name: 'Trading Bot License',
            price: 99.99,
            display_image:
              'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/bot-license.webp',
            division: 'capital',
            description: 'Lifetime access to premium trading bot, trusted by 100K+ users.',
            productType: 'download',
          },
        ];
        setProducts(fallback);
        setTotal(fallback.length);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = (product) => {
    const payload = { ...product, productType: 'download' };
    if (!payload.display_image) payload.display_image = pickImage(product);
    dispatch(addToCart(payload));
  };

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/chart-hero.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/performance-chart.png',
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading capital products...
      </div>
    );
  }

  const list = asList(products);

  return (
    <>
      <Head>
        <title>Manyagi Capital — Trusted Trading Insights</title>
        <meta name="description" content="Access real-time signals and bots used by millions." />
      </Head>

      <Hero
        kicker="Capital"
        title="Maximize Your Trades"
        lead="Leverage signals trusted by 100M+ users for better decisions."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link
          href="#subscribe" // point CTA to the restored subscribe section
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </Hero>

      {/* Live Market Insights */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Live Market Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <img src="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/performance-chart.png" alt="Performance Chart" className="w-full rounded" />
          <img src="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/chart-hero.webp" alt="Market Chart" className="w-full rounded" />
        </div>
      </section>

      <section id="performance" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Performance Charts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card
            title="Weekly Performance"
            description="View our latest trading results."
            image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/performance-chart.png"
            link="https://www.myfxbook.com/members/Blackkungfu/manyagi-meanpulse/11661957"
            category="capital"
          />
          <Card
            title="Bot Insights"
            description="Automated trading with proven results."
            image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/chart-hero.webp"
            category="capital"
          >
            <Link
              href="#products"
              className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Explore Bots
            </Link>
          </Card>
        </div>
      </section>

      <section
        id="products"
        className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {list.length === 0 ? (
          <div className="col-span-full text-center text-lg">
            No capital products found.
          </div>
        ) : (
          list.map((product) => (
            <Card
              key={product.id}
              title={product.name}
              description={product.description}
              image={product.display_image || pickImage(product)}
              category="capital"
              buyButton={product}
              onBuy={() => handleAddToCart(product)}
            />
          ))
        )}
      </section>

      {/* RESTORED: subscribe block from production */}
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SignalsSubscriptionForm />
      </section>

      <Recommender />
    </>
  );
}
