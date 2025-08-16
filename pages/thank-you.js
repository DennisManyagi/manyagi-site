import Head from 'next/head';
import Hero from '../components/Hero';
import Link from 'next/link';

export default function ThankYou() {
  return (
    <>
      <Head>
        <title>Thank You — Manyagi</title>
        <meta name="description" content="Thanks for subscribing or contacting us. Check your email." />
        <meta property="og:title" content="Thank You — Manyagi" />
        <meta property="og:description" content="Thanks for subscribing or contacting us. Check your email." />
        <meta property="og:image" content="https://manyagi.net/images/og-thankyou.jpg" />
        <meta property="og:url" content="https://manyagi.net/thank-you" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Thank You"
        title="You're In"
        lead="Check your email for confirmation and welcome. Stay tuned for updates."
      >
        <Link href="/" className="btn">Back to Home</Link>
      </Hero>
    </>
  );
}