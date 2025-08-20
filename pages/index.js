// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function Home() {
  return (
    <>
      <Head>
        <title>Manyagi — Innovation • IP • Commerce</title>
        <meta name="description" content="Manyagi unifies Publishing, Designs, Capital, Tech, and Media." />
      </Head>
      <section className="hero relative h-96 flex items-center justify-center overflow-hidden bg-white">
        <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" src="/videos/hero-video.mp4" />
        <div className="relative z-10 text-center text-black">
          <h1 className="text-5xl font-bold mb-4">Explore our worlds</h1>
          <p className="text-xl mb-8">One HQ powering books, fashion, trading, audio, and apps.</p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="tile bg-gray-100 rounded p-4 text-center">
          <img src="/images/publishing-tile.webp" alt="Publishing" className="w-full h-48 object-cover mb-4" />
          <h2 className="text-2xl font-bold">Publishing</h2>
          <p>Two novels + poetry. Read the opening chapter.</p>
          <Link href="/publishing" className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Explore</Link>
        </div>
        <div className="tile bg-gray-100 rounded p-4 text-center">
          <img src="/images/designs-tile.webp" alt="Designs" className="w-full h-48 object-cover mb-4" />
          <h2 className="text-2xl font-bold">Designs</h2>
          <p>Wear our stories with T-shirts, mugs.</p>
          <Link href="/designs" className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Explore</Link>
        </div>
        {/* Repeat for Capital, Tech, Media */}
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-12">
        <SubscriptionForm formId="8427635" uid="db12290300" title="Get chapter 1 + drops + early access" description="Be the first to know about updates." />
      </section>
      <Recommender />
    </>
  );
};