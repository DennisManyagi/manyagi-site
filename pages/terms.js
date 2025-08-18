import Head from 'next/head';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — Manyagi</title>
        <meta name="description" content="By using our site, you agree to our terms. Services are provided as-is. No warranties. Limitations on liability." />
        <meta property="og:title" content="Terms of Service — Manyagi" />
        <meta property="og:description" content="By using our site, you agree to our terms. Services are provided as-is. No warranties. Limitations on liability." />
        <meta property="og:image" content="/images/og-terms.jpg" />
        <meta property="og:url" content="https://manyagi.net/terms" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Our Terms"
        title="Terms of Service"
        lead="By using our site, you agree to our terms. Services are provided as-is. No warranties. Limitations on liability."
      />
      <section className="my-10">
        <Card>
          <p className="text-gray-600">Detailed terms content...</p>
        </Card>
      </section>
    </>
  );
}