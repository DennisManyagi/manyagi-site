import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Head>
        <title>Manyagi — Innovation • IP • Commerce</title>
        <meta name="description" content="Manyagi Management unifies Publishing, Designs, Capital, Media & Tech. Join for drops, chapters, signals, and app launches." />
        <meta property="og:title" content="Manyagi — Innovation • IP • Commerce" />
        <meta property="og:description" content="Manyagi Management unifies Publishing, Designs, Capital, Media & Tech. Join for drops, chapters, signals, and app launches." />
        <meta property="og:image" content="https://manyagi.net/images/og-home.jpg" />
        <meta property="og:url" content="https://manyagi.net/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Manyagi Management"
        title="Build. Publish. Design. Trade. Launch."
        lead="One HQ powering books & poetry, fashion & art, trading signals, audio & film, and apps like Daito."
      >
        <Link href="#subscribe" className="btn">Join the list</Link>
        <Link href="/publishing" className="btn ghost">Read Chapter 1</Link>
      </Hero>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card>
          <h3 className="text-2xl mb-2">Publishing</h3>
          <p className="text-muted mb-4">Two novels + poetry. Read the opening chapter and get updates.</p>
          <Link href="/publishing" className="btn">Explore Publishing</Link>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Designs</h3>
          <p className="text-muted mb-4">Book-inspired merch: tees, posters, prints, future NFTs.</p>
          <Link href="/designs" className="btn">Shop Designs</Link>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Capital</h3>
          <p className="text-muted mb-4">Trend & mean-reversion bots. Signals via Telegram. Transparent P/L.</p>
          <Link href="/capital" className="btn">Signals & Proof</Link>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Media</h3>
          <p className="text-muted mb-4">Audiobooks, voiceovers, YouTube/Shorts. Stories that travel.</p>
          <Link href="/media" className="btn">Enter Media</Link>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Tech — Daito</h3>
          <p className="text-muted mb-4">Buy & deliver anything. Market + logistics. Launching soon.</p>
          <Link href="/tech" className="btn">Tech Hub</Link>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Blog</h3>
          <p className="text-muted mb-4">Build logs, drops, and strategy notes as the empire scales.</p>
          <Link href="/blog" className="btn">Read Updates</Link>
        </Card>
      </section>
      <section id="subscribe" className="my-10">
        <Card>
          <SubscriptionForm formId="8427635" uid="db12290300" title="Get chapter 1 + drops + early access" description="Join the Manyagi Master List for news across all divisions." />
        </Card>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Testimonials</h3>
        <p className="text-muted mb-2">"Manyagi is building the future!" - User A</p>
        <p className="text-muted">"Love the cross-division synergy." - User B</p>
      </section>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        >
          <div className="card p-8">
            <h3 className="text-2xl mb-4">Discount Applied!</h3>
            <p className="text-muted mb-4">Buy book + get merch discount added.</p>
            <Link href="/cart" className="btn">View Cart</Link>
            <button onClick={() => setShowModal(false)} className="btn ghost mt-2">Close</button>
          </div>
        </motion.div>
      )}
    </>
  );
};