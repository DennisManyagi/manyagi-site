// pages/tech.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';

export default function Tech() {
  return (
    <>
      <Head>
        <title>Manyagi Tech — Apps for Commerce & Community</title>
        <meta name="description" content="Discover Daito and Nexu apps for commerce and community." />
      </Head>
      <Hero
        kicker="Tech"
        title="Apps for You"
        lead="Explore Daito and Nexu for seamless commerce and community engagement."
        height="h-[500px]"
      >
        <Link href="#apps" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
          Get Started
        </Link>
      </Hero>
      <section id="apps" className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card bg-gray-100 rounded p-4 text-center">
          <img src="/images/daito-screenshot.webp" alt="Daito App" className="w-full h-[400px] object-cover mb-4" />
          <h3 className="text-48px font-bold">Daito</h3>
          <p className="text-16px">A commerce app for seamless transactions.</p>
          <Link href="https://daito.app" className="btn bg-blue-600 text-white py-4 px-6 rounded mt-4 hover:scale-105 transition" target="_blank" rel="noopener noreferrer">
            Download
          </Link>
        </div>
        <div className="card bg-gray-100 rounded p-4 text-center">
          <img src="/images/nexu-screenshot.webp" alt="Nexu App" className="w-full h-[400px] object-cover mb-4" />
          <h3 className="text-48px font-bold">Nexu</h3>
          <p className="text-16px">Connect with our community.</p>
          <Link href="https://nexu.app" className="btn bg-blue-600 text-white py-4 px-6 rounded mt-4 hover:scale-105 transition" target="_blank" rel="noopener noreferrer">
            Download
          </Link>
        </div>
      </section>
      <section id="community" className="container mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
        <p className="text-base mb-4">Connect with users and creators on Daito and Nexu.</p>
        <Link href="https://community.manyagi.com" className="text-blue-600 hover:underline">Join Now</Link>
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-10">
        <SubscriptionForm
          formId="8432559"
          uid="701df306a9"
          title="Stay Updated on Tech"
          description="Get news on app updates and community events."
        />
      </section>
      <Recommender />
    </>
  );
};