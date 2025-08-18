import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Publishing() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  const handleBundle = () => {
    dispatch(addToCart({ id: 'book1', name: 'Legacy Book', price: 9.99 }));
    dispatch(addToCart({ id: 'merch1', name: 'Free Merch', price: 0 }));
    setShowModal(true);
  };

  return (
    <>
      <Head>
        <title>Manyagi Publishing — Books, Poetry, eBooks</title>
        <meta name="description" content="High-quality eBooks and audiobooks with global reach." />
        <meta property="og:title" content="Manyagi Publishing" />
        <meta property="og:description" content="High-quality eBooks and audiobooks with global reach." />
        <meta property="og:image" content="/images/og-publishing.jpg" />
        <meta property="og:url" content="https://manyagi.net/publishing" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Books & Poetry"
        title="Manyagi Publishing"
        lead="Join our waitlist for exclusive releases and build your library today!"
      >
        <Link href="/assets/Legacy_of_the_Hidden_Clans (Chapter 1)_by D.N. Manyagi.pdf" target="_blank" className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">Read Sample</Link>
      </Hero>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10" style={{ padding: '20px' }}>
        <Card>
          <Image src="/images/author-portrait.jpg" alt="Book Cover" width={300} height={400} className="rounded mb-4" />
          <h3 className="text-2xl mb-2 text-black">Legacy of the Hidden Clans</h3>
          <p className="text-gray-600 mb-4">An epic tale of mystery and adventure.</p>
          <button onClick={handleBundle} className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">Buy with Free Merch</button>
        </Card>
        <Card>
          <Image src="/images/book-cover-2.jpg" alt="Poetry Book" width={300} height={400} className="rounded mb-4" />
          <h3 className="text-2xl mb-2 text-black">Echoes of the Ancestors</h3>
          <p className="text-gray-600 mb-4">Poems that evoke deep emotions.</p>
        </Card>
      </section>
      <section className="my-10">
        <Card>
          <h3 className="text-2xl mb-4 text-black">Why Publish with Us</h3>
          <p className="text-gray-600">High-quality eBooks and audiobooks with global reach.</p>
        </Card>
      </section>
      <section className="my-10">
        <SubscriptionForm formId="8432549" uid="877716573d" title="Subscribe for Updates" description="Get exclusive releases." />
      </section>
      {showModal && (
        <motion.div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-8 rounded">
            <h3 className="text-2xl mb-4 text-black">Added to Cart</h3>
            <Link href="/cart" className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">View Cart</Link>
            <button onClick={() => setShowModal(false)} className="ml-2 text-gray-600">Close</button>
          </div>
        </motion.div>
      )}
    </>
  );
}