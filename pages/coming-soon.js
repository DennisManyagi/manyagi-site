// pages/coming-soon.js
import Head from 'next/head';
import Hero from '../components/Hero';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function ComingSoon() {
  return (
    <>
      <Head>
        <title>Coming Soon — Manyagi</title>
        <meta name="description" content="This page is under construction. Sign up for updates." />
      </Head>
      <Hero
        kicker="Coming Soon"
        title="Page Under Construction"
        lead="We're building this page — join the Manyagi newsletter for updates and early access."
        height="h-[500px]"
      />
      <section className="container mx-auto px-4 py-10">
        <SubscriptionForm formId="8427635" uid="db12290300" title="Get Notified" description="Be the first to know when it's live." />
      </section>
      <Recommender />
    </>
  );
};