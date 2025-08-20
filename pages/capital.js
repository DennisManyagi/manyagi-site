// pages/capital.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function Capital() {
  return (
    <>
      <Head>
        <title>Manyagi Capital — Trading Signals</title>
      </Head>
      <section className="hero text-center py-12 bg-white">
        <h1 className="text-5xl font-bold mb-4">Business News</h1>
        <p>Latest updates on markets and finance.</p>
        <video src="/videos/chart-video.mp4" autoPlay loop muted className="w-full h-64 object-cover mt-4" />
      </section>
      <section className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gray-100 rounded p-4">
          <h3 className="text-2xl font-bold">Charts & Education</h3>
          <p>Higher conversions 15% with our tools.</p>
          <Link href="#" className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Subscribe</Link>
        </div>
        {/* Repeat for more */}
      </section>
      <section className="container mx-auto px-4 py-12">
        <SubscriptionForm formId="8427635" uid="db12290300" title="Subscribe to Capital Updates" description="Get trading signals." includeTelegramId={true} />
      </section>
      <Recommender />
    </>
  );
};