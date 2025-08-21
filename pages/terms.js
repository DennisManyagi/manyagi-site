// pages/terms.js
import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Manyagi — Terms of Service</title>
        <meta name="description" content="Read Manyagi’s Terms of Service." />
      </Head>
      <Hero
        kicker="Terms"
        title="Terms of Service"
        lead="Understand the terms governing our services."
        carouselImages={['/images/og-home.webp']}
        height="h-[600px]"
      />
      <section className="container mx-auto px-4 py-16 text-sm space-y-4">
        <h2 className="text-xl font-bold">1. Introduction</h2>
        <p>By using Manyagi, you agree to these terms.</p>
        <h2 className="text-xl font-bold">2. Services</h2>
        <p>Details about our publishing, designs, capital, tech, and media services.</p>
        <h2 className="text-xl font-bold">3. GDPR Compliance</h2>
        <p>We comply with GDPR for data protection. See our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
      </section>
    </>
  );
};