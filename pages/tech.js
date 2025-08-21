// pages/tech.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Tech() {
  const carouselImages = [
    '/images/app-carousel-1.webp',
    '/images/app-carousel-2.webp',
    '/images/app-carousel-3.webp',
  ];

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
        carouselImages={carouselImages}
        videoSrc="/videos/hero-bg.mp4"
        height="h-[600px]"
      >
        <Link href="#apps" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
          Get Started
        </Link>
      </Hero>
      <section id="apps" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card
          title="Daito"
          description="A commerce app for seamless transactions."
          image="/images/daito-screenshot.webp"
          link="https://daito.app"
          category="tech"
          className="text-center"
        >
          <Link href="https://daito.app" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition" target="_blank" rel="noopener noreferrer">
            Download
          </Link>
        </Card>
        <Card
          title="Nexu"
          description="Connect with our community."
          image="/images/nexu-screenshot.webp"
          link="https://nexu.app"
          category="tech"
          className="text-center"
        >
          <Link href="https://nexu.app" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition" target="_blank" rel="noopener noreferrer">
            Download
          </Link>
        </Card>
      </section>
      <section id="community" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
        <Card
          title="Community"
          description="Connect with users and creators on Daito and Nexu."
          image="/images/app-carousel-1.webp"
          link="https://community.manyagi.com"
          category="tech"
          className="text-center"
        >
          <Link href="https://community.manyagi.com" className="text-blue-600 hover:underline">Join Now</Link>
        </Card>
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-16">
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