// pages/privacy.js
import Head from 'next/head';
import Link from 'next/link';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Manyagi — Privacy Policy</title>
        <meta name="description" content="Read Manyagi’s Privacy Policy." />
      </Head>
      <section className="hero text-center py-8 bg-white">
        <img src="/images/og-home.webp" alt="Privacy Hero" className="w-full h-[400px] object-cover mb-4" />
        <h1 className="text-xl font-bold mb-4">Privacy Policy</h1>
      </section>
      <section className="container mx-auto px-4 py-8 text-sm space-y-4">
        <h2 className="text-xl font-bold">1. Data Collection</h2>
        <p>We collect minimal data for services like subscriptions and orders.</p>
        <h2 className="text-xl font-bold">2. GDPR Compliance</h2>
        <p>We protect your data under GDPR. Contact us at support@manyagi.com.</p>
        <h2 className="text-xl font-bold">3. Cookies</h2>
        <p>We use cookies for analytics (Hotjar, Mixpanel).</p>
      </section>
    </>
  );
};