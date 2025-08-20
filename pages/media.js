// pages/media.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function Media() {
  return (
    <>
      <Head>
        <title>Manyagi Media — Stories in Motion</title>
      </Head>
      <section className="hero text-center py-12 bg-white">
        <h1 className="text-5xl font-bold mb-4">Explore collaborative articles</h1>
        <p>We’re unlocking community knowledge in a new way.</p>
        <video src="/videos/media-video.mp4" autoPlay loop muted className="w-full h-64 object-cover mt-4" />
      </section>
      <section className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="video-card bg-gray-100 rounded p-4">
          <img src="/images/video-thumbnail1.webp" alt="Video" className="w-full h-48 object-cover mb-4" />
          <h3 className="text-2xl font-bold">Book Narrations</h3>
          <p>Listen to chapters.</p>
          <Link href="#" className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Watch</Link>
        </div>
        {/* Repeat for more */}
      </section>
      <section className="container mx-auto px-4 py-12">
        <SubscriptionForm formId="8427635" uid="db12290300" title="Subscribe to Media Updates" description="Get latest videos." />
      </section>
      <Recommender />
    </>
  );
};