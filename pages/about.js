import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import { supabaseAdmin } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function About() {
  const [siteConfig, setSiteConfig] = useState({});

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await supabaseAdmin.from('site_config').select('*');
        setSiteConfig(data?.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}) || {});
      } catch (error) {
        console.error('About config fetch error:', error);
      }
    };
    fetchConfig();
  }, []);

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-about.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/team-photo.webp',
  ];

  return (
    <>
      <Head>
        <title>About Manyagi — Our Story</title>
        <meta name="description" content="Learn about Manyagi's mission and team." />
      </Head>
      <Hero
        kicker="About Us"
        title="Our Story"
        lead="Manyagi unites creativity and innovation across publishing, designs, capital, tech, media, and realty."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#team" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Meet the Team
        </Link>
      </Hero>

      <section id="mission" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
        <p className="max-w-2xl mx-auto text-lg">
          At Manyagi, we empower creators and innovators by providing a platform that bridges storytelling, commerce, and technology. From novels to trading signals, we bring diverse ideas to life.
        </p>
      </section>

      <section id="team" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded p-4">
            <img
              src="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/team-photo.webp"
              alt="Team"
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h3 className="text-xl font-bold">Our Diverse Team</h3>
            <p>A collective of creators, traders, and technologists passionate about innovation.</p>
          </div>
        </div>
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427853"
          uid="637df68a06"
          title="Stay Connected"
          description="Join our community for updates and insights."
        />
      </section>

      <Recommender />
    </>
  );
}