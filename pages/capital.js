import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Capital() {
  const [loading, setLoading] = useState(false);
  const [telegramId, setTelegramId] = useState('');

  const handleCheckout = async (priceId) => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      const response = await fetch('/api/stripe/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, telegramId }),
      });
      const { sessionId } = await response.json();
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Checkout error:', error);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Manyagi Capital — Bots & Signals</title>
        <meta name="description" content="Reliable bots for Crypto, Forex, Indices delivered via Telegram after subscription." />
        <meta property="og:title" content="Manyagi Capital — Bots & Signals" />
        <meta property="og:description" content="Reliable bots for Crypto, Forex, Indices delivered via Telegram after subscription." />
        <meta property="og:image" content="/images/og-capital.jpg" />
        <meta property="og:url" content="https://manyagi.net/capital" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Trading Systems"
        title="Algorithmic Signals"
        lead="Unlock financial growth with data-driven insights. Reliable bots for Crypto, Forex, Indices delivered via Telegram after subscription."
      >
        <Link href="#subscribe" className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">Subscribe Now</Link>
      </Hero>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card>
          <h3 className="text-2xl mb-2 text-black">Trading Signals</h3>
          <p className="text-gray-600 text-sm mb-4">Reliable bots for Crypto, Forex, Indices delivered via Telegram after subscription.</p>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2 text-black">Performance</h3>
          <Image src="/images/performance-chart.png" alt="Performance Chart" width={600} height={400} className="rounded mb-4" />
        </Card>
      </section>
      <section id="subscribe" className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card>
          <SubscriptionForm formId="8432549" uid="877716573d" title="Subscribe Now" description="Get trading signals via Telegram." includeTelegramId={true} />
          <button
            onClick={() => handleCheckout('price_1Rwfe5IFtQrr5DjcidsMeAOM')}
            className="w-full py-2 bg-yellow-500 text-black rounded font-bold hover:bg-yellow-400 mt-4"
            disabled={loading || !telegramId}
          >
            Subscribe ($29/mo)
          </button>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2 text-black">Bundles</h3>
          <p className="text-gray-600 text-sm mb-4">Bundles $150/mo through Stripe.</p>
        </Card>
      </section>
      <p className="text-center text-gray-600 text-sm">Cross-promotion: Use signals on Daito app.</p>
    </>
  );
}