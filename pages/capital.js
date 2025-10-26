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
  p?.thumbnail_url ||
  p?.display_image ||
  p?.image_url ||
  p?.image ||
  '';

export default function Capital() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // pull the public price id for Basic Signals from env
  const signalsPriceId =
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || '';

  useEffect(() => {
    (async () => {
      try {
        // fetch only capital division products from your existing API
        const res = await fetch('/api/products?division=capital');
        const json = await res.json();

        const list = asList(json).map((p) => ({
          ...p,
          display_image: pickImage(p),
          // unify productType between db row and fallback logic:
          productType:
            p.metadata?.productType ||
            p.productType ||
            'download',
        }));

        if (list.length === 0) {
          // fallback seed if DB is empty
          const fallback = [
            {
              id: 'signals-basic',
              name: 'Basic Signals',
              price: 29.99,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/chart-hero.webp',
              division: 'capital',
              description:
                'Daily trade entries & exits. Telegram alerts.',
              productType: 'subscription',
              metadata: {
                productType: 'subscription',
                plan_type: 'Basic Signals',
              },
            },
            {
              id: 'bot1',
              name: 'Trading Bot License',
              price: 99.99,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/bot-license.webp',
              division: 'capital',
              description:
                'Lifetime access to premium trading bot, trusted by 100K+ users.',
              productType: 'download',
              metadata: {
                productType: 'download',
                license_type: 'bot',
              },
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

        // on error, show the same useful fallback
        const fallback = [
          {
            id: 'signals-basic',
            name: 'Basic Signals',
            price: 29.99,
            display_image:
              'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/chart-hero.webp',
            division: 'capital',
            description:
              'Daily trade entries & exits. Telegram alerts.',
            productType: 'subscription',
            metadata: {
              productType: 'subscription',
              plan_type: 'Basic Signals',
            },
          },
          {
            id: 'bot1',
            name: 'Trading Bot License',
            price: 99.99,
            display_image:
              'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/bot-license.webp',
            division: 'capital',
            description:
              'Lifetime access to premium trading bot, trusted by 100K+ users.',
            productType: 'download',
            metadata: {
              productType: 'download',
              license_type: 'bot',
            },
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
    // this is only for non-subscription products
    const payload = {
      ...product,
      productType: 'download',
    };
    if (!payload.display_image)
      payload.display_image = pickImage(product);
    dispatch(addToCart(payload));
  };

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/chart-hero.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/performance-chart.webp',
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
        <meta
          name="description"
          content="Access real-time signals and bots used by millions."
        />
      </Head>

      <Hero
        kicker="Capital"
        title="Maximize Your Trades"
        lead="Leverage signals trusted by 100M+ users for better decisions."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link
          href="#subscribe"
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </Hero>

      <section
        id="performance"
        className="container mx-auto px-4 py-16"
      >
        <h2 className="text-3xl font-bold mb-6">
          Performance Charts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card
            title="Weekly Performance"
            description="View our latest trading results."
            image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/performance-chart.webp"
            link="https://www.myfxbook.com/members/Blackkungfu/manyagi-meanpulse/11661957"
            category="capital"
          >
            <iframe
              src="https://www.myfxbook.com/widgets/11661957"
              width="100%"
              height="300"
              title="MyFXBook Chart"
              className="mt-4"
            ></iframe>
          </Card>

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

      {/* PRODUCTS GRID */}
      <section
        id="products"
        className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {list.length === 0 ? (
          <div className="col-span-full text-center text-lg">
            No capital products found.
          </div>
        ) : (
          list.map((product) => {
            const isSub =
              product.metadata?.productType === 'subscription' ||
              product.productType === 'subscription';

            return (
              <Card
                key={product.id}
                title={product.name}
                description={product.description}
                image={
                  product.display_image || pickImage(product)
                }
                category="capital"
                buyButton={
                  isSub ? null : product /* for non-sub products */
                }
                onBuy={
                  isSub
                    ? undefined
                    : () => handleAddToCart(product)
                }
              >
                {/* If it's a subscription product, render inline subscribe CTA */}
                {isSub && (
                  <div className="mt-4 border rounded p-3 bg-white text-black">
                    <div className="text-sm font-semibold mb-2">
                      {product.price
                        ? `$${Number(
                            product.price
                          ).toFixed(2)}/month`
                        : '$/month'}
                    </div>
                    <SignalsSubscriptionForm
                      priceId={signalsPriceId}
                    />
                  </div>
                )}
              </Card>
            );
          })
        )}
      </section>

      {/* Big subscribe block / hero CTA */}
      <section
        id="subscribe"
        className="container mx-auto px-4 py-16"
      >
        <SignalsSubscriptionForm priceId={signalsPriceId} />
      </section>

      <Recommender />
    </>
  );
}
