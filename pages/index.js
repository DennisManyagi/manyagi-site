// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import Hero from '../components/Hero';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Card from '../components/Card';

export default function Home() {
  const dispatch = useDispatch();
  const carouselImages = [
    '/images/home-carousel-1.webp',
    '/images/home-carousel-2.webp',
    '/images/home-carousel-3.webp',
  ];

  const featuredBook = { id: 'book1', name: 'Legacy eBook', price: 9.99, productType: 'book', image: '/images/legacy-chapter-1.webp' };
  const featuredMerch = { id: 'merch1', name: 'Story Tee', price: 29.99, productType: 'merch', image: '/images/mock-tee-1.webp' };
  const featuredBot = { id: 'bot1', name: 'Trading Bot License', price: 99.99, productType: 'download', image: '/images/bot-license.webp' };

  return (
    <>
      <Head>
        <title>Manyagi — Innovation • IP • Commerce</title>
        <meta name="description" content="Manyagi unifies Publishing, Designs, Capital, Tech, and Media." />
      </Head>
      <Hero
        kicker="Welcome"
        title="Explore Our Worlds"
        lead="One HQ powering books, fashion, trading, audio, and apps."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#divisions" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:scale-105 transition">
          Explore
        </Link>
      </Hero>
      <section id="divisions" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card
          title="Publishing"
          description="Two novels + poetry. Read the opening chapter."
          image="/images/legacy-chapter-1.webp"
          link="/publishing"
          category="publishing"
          buyButton={featuredBook}
        />
        <Card
          title="Designs"
          description="Wear our stories with T-shirts, mugs."
          image="/images/mock-tee-1.webp"
          link="/designs"
          category="designs"
          buyButton={featuredMerch}
        />
        <Card
          title="Capital"
          description="Trading signals and bot charts for success."
          image="/images/chart-hero.webp"
          link="/capital"
          category="capital"
          buyButton={featuredBot}
        />
        <Card
          title="Tech"
          description="Apps for commerce and community."
          image="/images/daito-screenshot.webp"
          link="/tech"
          category="tech"
        >
          <Link href="/tech" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:scale-105 transition">
            Explore
          </Link>
        </Card>
        <Card
          title="Media"
          description="Stories in motion with videos and audio."
          image="/images/og-media.webp"
          link="/media"
          category="media"
        >
          <Link href="/media" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:scale-105 transition">
            Explore
          </Link>
        </Card>
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
};