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
import SectionIntro from '../components/SectionIntro';

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
  '/placeholder.png';

// hard defaults if no foundation-image rows exist yet
const FOUNDATION_DEFAULTS = {
  stocks:
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/capital-stocks.webp',
  crypto:
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/capital-crypto.webp',
  forex:
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/capital-forex.webp',
};

export default function Capital() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // global fallback price id for signals
  const globalSignalsPriceId =
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || '';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products?division=capital');
        const json = await res.json();

        const list = asList(json).map((p) => ({
          ...p,
          display_image: pickImage(p),
          productType:
            p.metadata?.productType ||
            p.product_type ||
            p.productType ||
            'download',
        }));

        if (list.length === 0) {
          // seed with a simple live-looking setup if DB is empty
          const fallback = [
            {
              id: 'signals-core',
              name: 'Core Signals Tier',
              price: 39.99,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/chart-hero.webp',
              division: 'capital',
              description:
                'Structured trade ideas across stocks, crypto, and forex with clear entries, exits, and invalidation levels.',
              productType: 'subscription',
              metadata: {
                productType: 'subscription',
                plan_type: 'Core Signals',
              },
            },
            {
              id: 'trading-playbook-pdf',
              name: 'Manyagi Trading Playbook (PDF)',
              price: 29.0,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/performance-chart.webp',
              division: 'capital',
              description:
                'A practical trading playbook that shows exactly how to build a rules-based plan, journal your trades, and review performance.',
              productType: 'download',
              metadata: {
                productType: 'download',
                license_type: 'ebook',
                format: 'pdf',
              },
            },
            {
              id: 'bot-license-core',
              name: 'Manyagi Bot License',
              price: 99.0,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/bot-license.webp',
              division: 'capital',
              description:
                'A license for an automated strategy that mirrors the same risk rules used in the Manyagi Trading Playbook.',
              productType: 'download',
              metadata: {
                productType: 'download',
                license_type: 'bot',
              },
            },
          ];

          setProducts(fallback);
        } else {
          setProducts(list);
        }
      } catch (error) {
        console.error('Capital fetch error:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = (product) => {
    const payload = {
      ...product,
      productType: 'download',
    };
    if (!payload.display_image) payload.display_image = pickImage(product);
    dispatch(addToCart(payload));
  };

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/chart-hero.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/performance-chart.webp',
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading capital content...
      </div>
    );
  }

  const list = asList(products);

  // Split out foundation-image configs so they drive the Stocks/Crypto/Forex cards
  const foundationImages = { ...FOUNDATION_DEFAULTS };
  const offers = [];

  list.forEach((p) => {
    const role = p.metadata?.role;
    const market = p.metadata?.market;

    if (
      p.division === 'capital' &&
      role === 'foundation-image' &&
      ['stocks', 'crypto', 'forex'].includes(market)
    ) {
      foundationImages[market] = pickImage(p);
    } else {
      offers.push(p);
    }
  });

  return (
    <>
      <Head>
        <title>Manyagi Capital — Signals, Bots &amp; Trading Playbooks</title>
        <meta
          name="description"
          content="Browse Manyagi Capital signals tiers, trading playbooks, and automation tools designed to keep your risk controlled and your decisions repeatable."
        />
      </Head>

      {/* HERO */}
      <Hero
        kicker="Capital"
        title="Trade With Structure, Not Guesswork"
        lead="Signals, bots, and trading playbooks built around risk, journaling, and repeatable rules — not lottery tickets."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link
          href="#products"
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          View Capital Catalog
        </Link>
      </Hero>

      {/* FOUNDATIONS INTRO */}
      <SectionIntro
        id="foundations"
        kicker="Foundations"
        title="Three Markets, One Playbook"
        lead="Before you lean on signals or automation, you need to understand the terrain. Stocks, crypto, and forex each move differently, but the discipline behind them is shared."
        tone="warm"
      />

      {/* EDUCATIONAL MARKET PILLARS */}
      <section className="container mx-auto px-4 pt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stocks */}
          <Card
            title="Stocks"
            description="Ownership in real companies. Great for long-term compounding, dividends, and riding macro trends with position sizing that fits your risk."
            image={foundationImages.stocks}
            category="capital"
          >
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>• Best for: long-term investing &amp; swing trades</li>
              <li>• Tools: earnings calendars, sector ETFs, options</li>
              <li>• Focus: risk management over hype cycles</li>
            </ul>
          </Card>

          {/* Crypto */}
          <Card
            title="Crypto"
            description="24/7 markets with higher volatility, on-chain narratives, and cycles that reward patience and risk control more than raw aggression."
            image={foundationImages.crypto}
            category="capital"
          >
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>• Best for: trend following &amp; cycle plays</li>
              <li>• Tools: spot, futures (with caution), staking</li>
              <li>• Focus: position sizing &amp; avoiding over-leverage</li>
            </ul>
          </Card>

          {/* Forex */}
          <Card
            title="Forex"
            description="Currencies driven by macro data, interest rates, and global flows. Highly liquid, but punishes undisciplined leverage more than any other market."
            image={foundationImages.forex}
            category="capital"
          >
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>• Best for: structured systems &amp; backtested edges</li>
              <li>• Tools: session-based strategies, EAs, algos</li>
              <li>• Focus: consistency, risk per trade, journal</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* ROADMAP INTRO (SectionIntro pill) */}
      <SectionIntro
        id="roadmap"
        kicker="Roadmap"
        title="How Manyagi Capital Evolves"
        lead="Education first, then signals, then automation. Every new product has to line up with the same rules: risk defined, process repeatable, stats tracked."
        tone="neutral"
      />

      {/* ROADMAP STEPS */}
      <section className="container mx-auto px-4 pt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/90 dark:bg-gray-900/80 p-5 shadow-sm">
            <p className="text-[11px] font-semibold tracking-[0.26em] uppercase text-amber-700/80 dark:text-amber-300/80 mb-2">
              Phase 1
            </p>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-50">
              Education &amp; Playbook
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Trading ebooks and frameworks that show you exactly how to define
              entries, exits, risk-per-trade, journaling, and review loops.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/90 dark:bg-gray-900/80 p-5 shadow-sm">
            <p className="text-[11px] font-semibold tracking-[0.26em] uppercase text-amber-700/80 dark:text-amber-300/80 mb-2">
              Phase 2
            </p>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-50">
              Signals &amp; Market Notes
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Rules-based trade ideas with context, risk levels, and
              invalidation points — built as an extension of the playbook, not a
              replacement for thinking.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/90 dark:bg-gray-900/80 p-5 shadow-sm">
            <p className="text-[11px] font-semibold tracking-[0.26em] uppercase text-amber-700/80 dark:text-amber-300/80 mb-2">
              Phase 3
            </p>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-50">
              Automation &amp; Bots
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Once systems are proven, bots and semi-automated tools reflect the
              same rules — with safety rails and transparent stats instead of
              black-box magic.
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCTS / CATALOG INTRO (SectionIntro pill) */}
      <SectionIntro
        id="products"
        kicker="Catalog"
        title="Capital Products &amp; Services"
        lead="Signals tiers, trading playbooks, and automation licenses — all under the same risk-first philosophy."
        tone="neutral"
      />

      {/* PRODUCTS / CATALOG GRID */}
      <section className="container mx-auto px-4 pt-8 pb-16">
        {/* Snapshot pill */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl bg-white/80 border border-amber-200/70 shadow-sm text-sm text-gray-700 text-center dark:bg-gray-900/70 dark:border-amber-800/60 dark:text-gray-100">
            <span className="text-[11px] font-semibold tracking-[0.26em] uppercase text-amber-700/80 dark:text-amber-300/80">
              Capital Snapshot
            </span>
            <span>
              Showing{' '}
              <span className="font-semibold">{offers.length}</span>{' '}
              live {offers.length === 1 ? 'offer' : 'offers'} right now.
            </span>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.length === 0 ? (
            <div className="col-span-full text-center text-lg">
              No capital products are listed yet. Check back soon.
            </div>
          ) : (
            offers.map((product) => {
              const productKind =
                product.metadata?.productType ||
                product.productType ||
                'download';

              const hasPlanType = !!product.metadata?.plan_type;
              const hasLicenseType = !!product.metadata?.license_type;

              // Treat anything with a plan_type (and no license_type) as a subscription,
              // even if productType was set wrong in the admin form.
              const isSub =
                productKind === 'subscription' ||
                (hasPlanType && !hasLicenseType);

              const stage =
                product.metadata?.plan_type ||
                product.metadata?.license_type ||
                product.metadata?.stage ||
                '';

              const priceId =
                product.metadata?.stripe_price_id || globalSignalsPriceId;

              const priceLabel = product.price
                ? `$${Number(product.price).toFixed(2)}/month`
                : '';

              const planName =
                product.metadata?.plan_type || product.name || 'Signals';

              return (
                <Card
                  key={product.id}
                  title={product.name}
                  description={product.description}
                  image={product.display_image || pickImage(product)}
                  category="capital"
                  buyButton={!isSub && product.price > 0 ? product : null}
                  onBuy={
                    !isSub && product.price > 0
                      ? () => handleAddToCart(product)
                      : undefined
                  }
                >
                  {/* Pill showing plan / license type */}
                  {stage && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {String(stage).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Subscription / signals */}
                  {isSub ? (
                    <div className="mt-2 border rounded-2xl p-3 bg-white/90 dark:bg-gray-900/70 dark:border-gray-700 text-sm">
                      <SignalsSubscriptionForm
                        priceId={priceId}
                        planName={planName}
                        priceLabel={priceLabel}
                      />
                      {!priceId && (
                        <p className="text-[11px] text-red-500 mt-2">
                          Missing Stripe price ID for this tier. Add{' '}
                          <code>metadata.stripe_price_id</code> in the admin
                          panel or set <code>NEXT_PUBLIC_STRIPE_PRICE_ID</code>{' '}
                          as a fallback.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Instant digital access after checkout. Review the full
                      risk disclaimer before using any strategy or automation.
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* BIG CTA: UPDATES / ECOSYSTEM */}
      <SectionIntro
        id="subscribe"
        kicker="Stay In The Loop"
        title="Get Capital Updates &amp; New Releases"
        lead="Bookmark this page or plug into the Manyagi ecosystem through Publishing and Media — release notes and performance breakdowns will roll out as new tiers and tools go live."
        tone="warm"
      />

      {/* CROSS-DIVISION RECOMMENDER */}
      <Recommender />
    </>
  );
}
