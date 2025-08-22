// pages/about.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function About() {
  const carouselImages = [
    '/images/team-photo.webp',
    '/images/community-photo.webp',
    '/images/og-about.webp',
  ];

  return (
    <>
      <Head>
        <title>Manyagi — About Us</title>
        <meta name="description" content="Learn about Manyagi’s mission and team." />
      </Head>
      <Hero
        kicker="About"
        title="Our Story"
        lead="Unifying creativity and commerce across publishing, designs, capital, tech, and media."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#mission" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
          Learn More
        </Link>
      </Hero>
      <section id="mission" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
        <p className="text-base mb-4">Manyagi creates stories and experiences that inspire and connect.</p>
      </section>
      <section id="team" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card
          title="Our Team"
          description="Meet the creators behind Manyagi."
          image="/images/team-photo.webp"
          link="#team"
          category="about"
          className="text-center"
        >
          <Link href="#team" className="text-blue-600 hover:underline">Learn More</Link>
        </Card>
        <Card
          title="Our Community"
          description="Join our global community of storytellers."
          image="/images/community-photo.webp"
          link="https://community.manyagi.com"
          category="about"
          className="text-center"
        >
          <Link href="https://community.manyagi.com" className="text-blue-600 hover:underline">Join Now</Link>
        </Card>
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427635"
          uid="db12290300"
          title="Join Our Journey"
          description="Stay updated on our mission and projects."
        />
      </section>
    </>
  );
};