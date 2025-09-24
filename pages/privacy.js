// pages/privacy.js
import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Manyagi — Privacy Policy</title>
        <meta name="description" content="Read Manyagi’s Privacy Policy." />
      </Head>
      <Hero
        kicker="Privacy"
        title="Privacy Policy"
        lead="Learn how we protect your data."
        carouselImages={['/images/og-home.webp']}
        height="h-[600px]"
      />
      <section className="container mx-auto px-4 py-16 text-sm space-y-4">
        <h2 className="text-xl font-bold">1. Data Collection</h2>
        <p>We collect minimal data for services like subscriptions and orders.</p>
        <h2 className="text-xl font-bold">2. GDPR Compliance</h2>
        <p>We protect your data under GDPR. Contact us at <a href="mailto:support@manyagi.net" className="text-blue-600 hover:underline">support@manyagi.net</a>.</p>
        <h2 className="text-xl font-bold">3. Cookies</h2>
        <p>We use cookies for analytics.</p>
      </section>
    </>
  );
}
