import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';

export default function About() {
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
      <Hero kicker="About Us" title="Our Story" lead="Manyagi unites creativity and innovation across publishing, designs, capital, tech, media, and realty." carouselImages={carouselImages} height="h-[600px]">
        <Link href="#team" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">Meet the Team</Link>
      </Hero>

      {/* …your existing content … */}

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm formId="8427853" uid="637df68a06" title="Stay Connected" description="Join our community for updates and insights." />
      </section>

      <Recommender />
    </>
  );
}
