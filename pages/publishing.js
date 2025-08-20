// pages/publishing.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function Publishing() {
  return (
    <>
      <Head>
        <title>Manyagi Publishing — Novels & Poetry</title>
      </Head>
      <section className="hero text-center py-12 bg-white">
        <h1 className="text-5xl font-bold mb-4">Readers’ Picks: Books That Feel Like Summer</h1>
        <p>Summer’s not over yet! Discover what avid readers have chosen as essential reads.</p>
        <Link href="#" className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Read More</Link>
      </section>
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6">Recommended Right Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gray-100 rounded p-4">
            <img src="/images/book-image1.webp" alt="Book" className="w-full h-48 object-cover mb-4" />
            <h3 className="text-2xl font-bold">15 Cozy Fantasy Books</h3>
            <p>Curl up with these endlessly charming stories full of whimsy and magical lands.</p>
            <Link href="#" className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">See the list</Link>
          </div>
          {/* Repeat for 2 more */}
        </div>
      </section>
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6">Discover Your Next Read</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>New Releases</div>
          <div>Best Sellers</div>
          <div>Mystery & Suspense</div>
          {/* More categories */}
        </div>
      </section>
      <section id="join" className="container mx-auto px-4 py-12">
        <SubscriptionForm formId="8427635" uid="db12290300" title="Subscribe to Publishing Updates" description="Get new chapters, poetry releases." />
      </section>
      <Recommender />
    </>
  );
};