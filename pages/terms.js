import Head from 'next/head';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — Manyagi</title>
        <meta name="description" content="Terms of service for Manyagi websites and apps." />
        <meta property="og:title" content="Terms of Service — Manyagi" />
        <meta property="og:description" content="Terms of service for Manyagi websites and apps." />
        <meta property="og:image" content="https://manyagi.net/images/og-terms.jpg" />
        <meta property="og:url" content="https://manyagi.net/terms" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Our Agreement"
        title="Terms of Service"
        lead="By using Manyagi.net, you agree to these terms."
      />
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Use</h3>
        <p className="text-muted mb-4">Content is for personal use. No reproduction without permission.</p>
        <h3 className="text-2xl mb-4">Subscriptions</h3>
        <p className="text-muted mb-4">Emails can be unsubscribed anytime. No spam.</p>
        <h3 className="text-2xl mb-4">Disclaimers</h3>
        <p className="text-muted mb-4">No warranties. Use at own risk. Trading signals not advice.</p>
        <h3 className="text-2xl mb-4">Changes</h3>
        <p className="text-muted mb-4">Terms may update. Continued use implies acceptance.</p>
        <h3 className="text-2xl mb-4">Contact</h3>
        <p className="text-muted">info@manyagi.net</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Intellectual Property</h3>
        <p className="text-muted">All content is owned by Manyagi. Unauthorized use prohibited.</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Limitation of Liability</h3>
        <p className="text-muted">Not liable for indirect damages.</p>
      </section>
    </>
  );
}