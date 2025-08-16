import Head from 'next/head';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Manyagi</title>
        <meta name="description" content="Privacy policy for Manyagi websites and apps." />
        <meta property="og:title" content="Privacy Policy — Manyagi" />
        <meta property="og:description" content="Privacy policy for Manyagi websites and apps." />
        <meta property="og:image" content="https://manyagi.net/images/og-privacy.jpg" />
        <meta property="og:url" content="https://manyagi.net/privacy" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Your Data"
        title="Privacy Policy"
        lead="We respect your privacy. This policy describes how we collect, use, and protect data."
      />
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">What we collect</h3>
        <p className="text-muted mb-4">Email (when you subscribe), basic analytics (page views), and voluntary form fields.</p>
        <h3 className="text-2xl mb-4">How we use it</h3>
        <p className="text-muted mb-4">To deliver chapters, updates, discounts, and product news you requested.</p>
        <h3 className="text-2xl mb-4">Sharing</h3>
        <p className="text-muted mb-4">We do not sell your data. We use third-party processors (e.g., ConvertKit, Stripe) to deliver services.</p>
        <h3 className="text-2xl mb-4">Security</h3>
        <p className="text-muted mb-4">We take reasonable measures to protect data. No method is 100% secure.</p>
        <h3 className="text-2xl mb-4">Contact</h3>
        <p className="text-muted">Email: info@manyagi.net</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Cookies</h3>
        <p className="text-muted">We use cookies for analytics and preferences. Manage via browser settings.</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">GDPR Compliance</h3>
        <p className="text-muted">We comply with GDPR for EU users. Request data deletion via contact.</p>
      </section>
    </>
  );
}