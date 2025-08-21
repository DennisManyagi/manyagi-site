// pages/coming-soon.js
import Head from 'next/head';
import Hero from '../components/Hero';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function ComingSoon() {
  const carouselImages = [
    '/images/og-comingsoon.webp',
    '/images/home-carousel-1.webp',
    '/images/home-carousel-2.webp',
  ];

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
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <a href="https://manyagi.net" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
          Back to Home
        </a>
      </Hero>
      <section className="container mx-auto px-4 py-16">
        <SubscriptionForm formId="8427635" uid="db12290300" title="Get Notified" description="Be the first to know when it's live." />
      </section>
      <Recommender />
    </>
  );
};