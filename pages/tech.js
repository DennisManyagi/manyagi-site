// pages/tech.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function Tech() {
  return (
    <>
      <Head>
        <title>Manyagi Tech — Apps for Commerce</title>
      </Head>
      <section className="hero text-center py-12 bg-white">
        <h1 className="text-5xl font-bold mb-4">Be the next big thing</h1>
        <p>Dream big, build fast, and grow far.</p>
        <Link href="#" className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Get Started</Link>
      </section>
      <section className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="feature bg-gray-100 rounded p-4">
          <img src="/images/app-screenshot1.webp" alt="App" className="w-full h-48 object-cover mb-4" />
          <h3 className="text-2xl font-bold">Daito Marketplace</h3>
          <p>Buy and sell merch, books.</p>
          <Link href="#" className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Download</Link>
        </div>
        {/* Repeat for Nexu, Nurse */}
      </section>
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6">Community Features</h2>
        <p>Explore collaborative articles.</p>
        {/* Community content */}
      </section>
      <section className="container mx-auto px-4 py-12">
        <SubscriptionForm formId="8427635" uid="db12290300" title="Subscribe to Tech Updates" description="Get app launches." />
      </section>
      <Recommender />
    </>
  );
};