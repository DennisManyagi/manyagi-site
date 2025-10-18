// pages/404.js
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Recommender from '../components/Recommender';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Portal Not Found — Manyagi</title>
        <meta
          name="description"
          content="This realm doesn’t exist — but your journey continues. Discover Publishing, Designs, Capital, Tech, Media, and Realty."
        />
        <meta name="robots" content="noindex,follow" />
      </Head>

      <section className="relative overflow-hidden">
        {/* Background aura */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none"
             style={{
               backgroundImage:
                 'radial-gradient(40% 40% at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 70%)',
             }}
        />

        <div className="container mx-auto px-4 py-24 text-white text-center">
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight"
          >
            Portal Not Found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-4 text-gray-300 max-w-2xl mx-auto"
          >
            Looks like this realm doesn’t exist — but your journey continues.
            Choose a gateway below and step back into the Manyagi universe.
          </motion.p>

          {/* Primary actions */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link href="/" className="btn bg-yellow-500 text-black px-5 py-2 rounded-lg hover:bg-yellow-400 transition">
              Return to HQ
            </Link>
            <Link href="/publishing" className="btn bg-white text-black px-5 py-2 rounded-lg hover:bg-gray-200 transition">
              Explore Publishing
            </Link>
            <Link href="/designs" className="btn bg-white/10 text-white px-5 py-2 rounded-lg hover:bg-white/20 transition border border-white/20">
              Shop Designs
            </Link>
          </motion.div>

          {/* Helpful discovery (turns 404 into a conversion moment) */}
          <div className="mt-14 bg-white text-black rounded-xl shadow-lg p-6 dark:bg-gray-900 dark:text-white">
            <h2 className="text-2xl font-bold mb-3">Recommended for you</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Popular picks across our divisions.
            </p>
            <Recommender />
          </div>

          {/* Quick deep links */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-300">
            <Link href="/media" className="hover:text-yellow-400 transition">Media</Link>
            <Link href="/capital" className="hover:text-yellow-400 transition">Capital</Link>
            <Link href="/tech" className="hover:text-yellow-400 transition">Tech</Link>
            <Link href="/realty" className="hover:text-yellow-400 transition">Realty</Link>
            <Link href="/blog" className="hover:text-yellow-400 transition">Blog</Link>
            <Link href="/about" className="hover:text-yellow-400 transition">About</Link>
          </div>
        </div>
      </section>
    </>
  );
}
