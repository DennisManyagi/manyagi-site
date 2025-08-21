// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function Home() {
  const carouselImages = [
    '/images/home-carousel-1.webp',
    '/images/home-carousel-2.webp',
    '/images/home-carousel-3.webp',
  ];

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
      <section id="divisions" className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="tile bg-gray-100 rounded p-4 text-center">
          <img src="/images/legacy-chapter-1.webp" alt="Publishing" className="w-full h-[300px] object-cover mb-4 hover:zoom transition" />
          <h2 className="text-40px font-bold">Publishing</h2>
          <p className="text-16px">Two novels + poetry. Read the opening chapter.</p>
          <Link href="/publishing" className="btn bg-blue-600 text-white py-2 px-4 rounded mt-4 hover:scale-105 transition">
            Explore
          </Link>
        </div>
        <div className="tile bg-gray-100 rounded p-4 text-center">
          <img src="/images/mock-tee-1.webp" alt="Designs" className="w-full h-[300px] object-cover mb-4 hover:zoom transition" />
          <h2 className="text-40px font-bold">Designs</h2>
          <p className="text-16px">Wear our stories with T-shirts, mugs.</p>
          <Link href="/designs" className="btn bg-blue-600 text-white py-2 px-4 rounded mt-4 hover:scale-105 transition">
            Explore
          </Link>
        </div>
        <div className="tile bg-gray-100 rounded p-4 text-center">
          <img src="/images/chart-hero.webp" alt="Capital" className="w-full h-[300px] object-cover mb-4 hover:zoom transition" />
          <h2 className="text-40px font-bold">Capital</h2>
          <p className="text-16px">Trading signals and bot charts for success.</p>
          <Link href="/capital" className="btn bg-blue-600 text-white py-2 px-4 rounded mt-4 hover:scale-105 transition">
            Explore
          </Link>
        </div>
        <div className="tile bg-gray-100 rounded p-4 text-center">
          <img src="/images/daito-screenshot.webp" alt="Tech" className="w-full h-[300px] object-cover mb-4 hover:zoom transition" />
          <h2 className="text-40px font-bold">Tech</h2>
          <p className="text-16px">Apps for commerce and community.</p>
          <Link href="/tech" className="btn bg-blue-600 text-white py-2 px-4 rounded mt-4 hover:scale-105 transition">
            Explore
          </Link>
        </div>
        <div className="tile bg-gray-100 rounded p-4 text-center">
          <img src="/images/og-media.webp" alt="Media" className="w-full h-[300px] object-cover mb-4 hover:zoom transition" />
          <h2 className="text-40px font-bold">Media</h2>
          <p className="text-16px">Stories in motion with videos and audio.</p>
          <Link href="/media" className="btn bg-blue-600 text-white py-2 px-4 rounded mt-4 hover:scale-105 transition">
            Explore
          </Link>
        </div>
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-10">
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