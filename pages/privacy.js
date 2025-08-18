import Head from 'next/head';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Manyagi</title>
        <meta name="description" content="We respect your privacy. We collect data only for service improvement and do not share with third parties without consent." />
        <meta property="og:title" content="Privacy Policy — Manyagi" />
        <meta property="og:description" content="We respect your privacy. We collect data only for service improvement and do not share with third parties without consent." />
        <meta property="og:image" content="/images/og-privacy.jpg" />
        <meta property="og:url" content="https://manyagi.net/privacy" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Your Privacy"
        title="Privacy Policy"
        lead="We respect your privacy. We collect data only for service improvement and do not share with third parties without consent. For details, contact us."
      />
      <section className="my-10">
        <Card>
          <p className="text-gray-600">Detailed privacy policy content...</p>
        </Card>
      </section>
    </>
  );
}