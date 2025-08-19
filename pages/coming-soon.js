// pages/coming-soon.js
import Head from 'next/head';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function ComingSoon() {
  return (
    <>
      <Head>
        <title>Coming Soon — Manyagi</title>
        <meta name="description" content="This page is under construction. Sign up for updates." />
        <meta property="og:title" content="Coming Soon — Manyagi" />
        <meta property="og:description" content="This page is under construction. Sign up for updates." />
        <meta property="og:image" content="https://manyagi.net/images/og-comingsoon.jpg" />
        <meta property="og:url" content="https://manyagi.net/coming-soon" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Coming Soon"
        title="Page Under Construction"
        lead="We're building this page — join the Manyagi newsletter for updates and early access."
      />
      <section className="my-10">
        <Card>
          <SubscriptionForm formId="8427635" uid="db12290300" title="Get Notified" description="Be the first to know when it's live." />
        </Card>
      </section>
      <Recommender />
    </>
  );
};