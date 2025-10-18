// pages/500.js
import Link from 'next/link';
import Head from 'next/head';
import Recommender from '../components/Recommender';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>System Interruption — Manyagi</title>
        <meta
          name="description"
          content="Something went wrong within the Manyagi network. Our engineers are restoring balance."
        />
        <meta name="robots" content="noindex,follow" />
      </Head>

      <section className="relative overflow-hidden">
        {/* Deep crimson background for urgency */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-950 via-black to-black" />
        <div className="container mx-auto px-4 py-24 text-white text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            System Interruption
          </h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            Something went wrong within the Manyagi network. Our engineers are restoring balance.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn bg-yellow-500 text-black px-5 py-2 rounded-lg hover:bg-yellow-400 transition">
              Return to HQ
            </Link>
            <Link href="/status" className="btn bg-white text-black px-5 py-2 rounded-lg hover:bg-gray-200 transition">
              System Status
            </Link>
          </div>

          {/* Give users somewhere valuable to go */}
          <div className="mt-14 bg-white text-black rounded-xl shadow-lg p-6 dark:bg-gray-900 dark:text-white">
            <h2 className="text-2xl font-bold mb-3">Explore while we fix things</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Here are some popular picks across our divisions.
            </p>
            <Recommender />
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-300">
            <Link href="/publishing" className="hover:text-yellow-400 transition">Publishing</Link>
            <Link href="/designs" className="hover:text-yellow-400 transition">Designs</Link>
            <Link href="/media" className="hover:text-yellow-400 transition">Media</Link>
            <Link href="/capital" className="hover:text-yellow-400 transition">Capital</Link>
            <Link href="/tech" className="hover:text-yellow-400 transition">Tech</Link>
            <Link href="/realty" className="hover:text-yellow-400 transition">Realty</Link>
          </div>
        </div>
      </section>
    </>
  );
}
