import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import Hero from '../components/Hero';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Card from '../components/Card';
import { useEffect, useState } from 'react';

export default function Home() {
  const dispatch = useDispatch();
  const [siteConfig, setSiteConfig] = useState({});
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await fetch('/api/site-config').then(r => r.json()).catch(() => ({}));
        setSiteConfig(cfg || {});
        const prods = await fetch('/api/products').then(r => r.json()).catch(() => []);
        setProducts(prods || []);
      } catch (e) {
        console.error('Home fetch error:', e);
      }
    })();
  }, []);

  const carouselImages = siteConfig.carousel_images || ['/images/home-carousel-1.webp','/images/home-carousel-2.webp','/images/home-carousel-3.webp'];
  const heroImage = siteConfig.hero?.file_url || '/videos/hero-bg.mp4';

  return (
    <>
      <Head>
        <title>Manyagi — Innovation • IP • Commerce</title>
        <meta name="description" content="Manyagi unifies Publishing, Designs, Capital, Tech, and Media." />
        {siteConfig.favicon?.file_url && <link rel="icon" href={siteConfig.favicon.file_url} />}
      </Head>
      <Hero kicker="Welcome" title="Explore Our Worlds" lead="One HQ powering books, fashion, trading, audio, and apps." carouselImages={carouselImages} videoSrc={heroImage} height="h-[600px]">
        <Link href="#divisions" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:scale-105 transition">Explore</Link>
      </Hero>

      <section id="divisions" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card title="Publishing" description="Two novels + poetry. Read the opening chapter." image={siteConfig.publishing_hero || "/images/legacy-chapter-1.webp"} link="/publishing" category="publishing" />
        <Card title="Designs" description="Wear our stories with T-shirts, mugs." image={siteConfig.designs_hero || "/images/mock-tee-1.webp"} link="/designs" category="designs" />
        <Card title="Capital" description="Trading signals and bot charts for success." image={siteConfig.capital_hero || "/images/chart-hero.webp"} link="/capital" category="capital" />
        <Card title="Tech" description="Apps for commerce and community." image={siteConfig.tech_hero || "/images/daito-screenshot.webp"} link="/tech" category="tech" />
        <Card title="Media" description="Stories in motion with videos and audio." image={siteConfig.media_hero || "/images/og-media.webp"} link="/media" category="media" />
        <Card title="Realty" description="Premium properties and rentals." image={siteConfig.realty_hero || "/images/rental-bigbear.webp"} link="/realty" category="realty" />
      </section>

      <section id="featured" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.slice(0, 3).map((product) => (
            <Card
              key={product.id}
              title={product.name}
              description={product.description}
              image={product.image_url}
              category={product.division}
              buyButton={product}
              onBuy={() => dispatch(addToCart({ ...product, productType: product.division === 'designs' ? 'merch' : product.division === 'capital' ? 'download' : 'book' }))}
            />
          ))}
        </div>
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm formId="8427635" uid="db12290300" title="Get Chapter 1 + Drops + Early Access" description="Be the first to know about updates." />
      </section>

      <Recommender />
    </>
  );
}
