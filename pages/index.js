// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import Hero from '../components/Hero';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Card from '../components/Card';
import { useEffect, useState } from 'react';

function getCfgImg(val, fallback) {
  // site_config values might be a plain string URL or { file_url }
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.file_url) return val.file_url;
  return fallback;
}

export default function Home() {
  const dispatch = useDispatch();
  const [siteConfig, setSiteConfig] = useState({});
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // site config
        const cfg = await fetch('/api/site-config')
          .then(r => r.json())
          .catch(() => ({}));
        setSiteConfig(cfg || {});

        // products (accept both array and { items, total })
        const res = await fetch('/api/products?limit=12');
        const json = await res.json().catch(() => []);
        const items = Array.isArray(json) ? json : (Array.isArray(json.items) ? json.items : []);

        // normalize image field so Card gets a valid image
        const normalized = items.map(p => ({
          ...p,
          image_url: p.image_url || p.thumbnail_url || p.image || p.imageUrl || '',
        }));

        setProducts(normalized);
      } catch (e) {
        console.error('Home fetch error:', e);
        setProducts([]); // stay safe
      }
    })();
  }, []);

  const carouselImages = siteConfig.carousel_images || [
    '/images/home-carousel-1.webp',
    '/images/home-carousel-2.webp',
    '/images/home-carousel-3.webp',
  ];
  const heroImage = getCfgImg(siteConfig.hero, '/videos/hero-bg.mp4');

  // Safe, existing fallbacks for division cards (prevents 404 on rental-bigbear.webp)
  const publishingImg = getCfgImg(siteConfig.publishing_hero, '/images/legacy-chapter-1.webp');
  const designsImg   = getCfgImg(siteConfig.designs_hero,   '/images/mock-tee-1.webp');
  const capitalImg   = getCfgImg(siteConfig.capital_hero,   '/images/chart-hero.webp');
  const techImg      = getCfgImg(siteConfig.tech_hero,      '/images/daito-screenshot.webp');
  const mediaImg     = getCfgImg(siteConfig.media_hero,     '/images/og-media.webp');
  const realtyImg    = getCfgImg(siteConfig.realty_hero,    '/images/realty-hero.webp'); // <— changed fallback

  return (
    <>
      <Head>
        <title>Manyagi — Innovation • IP • Commerce</title>
        <meta
          name="description"
          content="Manyagi unifies Publishing, Designs, Capital, Tech, and Media."
        />
        {getCfgImg(siteConfig.favicon, null) && (
          <link rel="icon" href={getCfgImg(siteConfig.favicon)} />
        )}
      </Head>

      <Hero
        kicker="Welcome"
        title="Explore Our Worlds"
        lead="One HQ powering books, fashion, trading, audio, and apps."
        carouselImages={carouselImages}
        videoSrc={heroImage}
        height="h-[600px]"
      >
        <Link
          href="#divisions"
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:scale-105 transition"
        >
          Explore
        </Link>
      </Hero>

      <section
        id="divisions"
        className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        <Card
          title="Publishing"
          description="Two novels + poetry. Read the opening chapter."
          image={publishingImg}
          link="/publishing"
          category="publishing"
        />
        <Card
          title="Designs"
          description="Wear our stories with T-shirts, mugs."
          image={designsImg}
          link="/designs"
          category="designs"
        />
        <Card
          title="Capital"
          description="Trading signals and bot charts for success."
          image={capitalImg}
          link="/capital"
          category="capital"
        />
        <Card
          title="Tech"
          description="Apps for commerce and community."
          image={techImg}
          link="/tech"
          category="tech"
        />
        <Card
          title="Media"
          description="Stories in motion with videos and audio."
          image={mediaImg}
          link="/media"
          category="media"
        />
        <Card
          title="Realty"
          description="Premium properties and rentals."
          image={realtyImg}
          link="/realty"
          category="realty"
        />
      </section>

      <section id="featured" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(Array.isArray(products) ? products : []).slice(0, 3).map((product) => (
            <Card
              key={product.id}
              title={product.name}
              description={product.description}
              image={product.image_url}
              category={product.division}
              buyButton={product}
              onBuy={() =>
                dispatch(
                  addToCart({
                    ...product,
                    productType:
                      product.division === 'designs'
                        ? 'merch'
                        : product.division === 'capital'
                        ? 'download'
                        : 'book',
                  })
                )
              }
            />
          ))}
        </div>
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427635"
          uid="db12290300"
          title="Get Chapter 1 + Drops + Early Access"
          description="Be the first to know about updates."
        />
      </section>

      <Recommender />
    </>
  );
}
