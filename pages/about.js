// pages/about.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Hero from '../components/Hero';

export default function About() {
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
        height="h-[400px]"
      >
        <Link href="#mission" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
          Learn More
        </Link>
      </Hero>
      <section id="mission" className="container mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
        <p className="text-base mb-4">Manyagi creates stories and experiences that inspire and connect.</p>
      </section>
      <section id="team" className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card bg-gray-100 rounded p-4 text-center">
          <img src="/images/team-photo.webp" alt="Team" className="w-full h-[300px] object-cover mb-4" />
          <h3 className="text-2xl font-bold">Our Team</h3>
          <p className="text-base">Meet the creators behind Manyagi.</p>
          <Link href="#team" className="text-blue-600 hover:underline">Learn More</Link>
        </div>
        <div className="card bg-gray-100 rounded p-4 text-center">
          <img src="/images/community-photo.webp" alt="Community" className="w-full h-[300px] object-cover mb-4" />
          <h3 className="text-2xl font-bold">Our Community</h3>
          <p className="text-base">Join our global community of storytellers.</p>
          <Link href="https://community.manyagi.com" className="text-blue-600 hover:underline">Join Now</Link>
        </div>
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-10">
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