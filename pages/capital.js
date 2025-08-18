import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Capital() {
  const { data: session, status } = useSession();
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

  if (status === 'loading') return <p>Loading...</p>;

  if (!session) {
    return (
      <>
        <Hero title="Capital Access" lead="Login to view full signals and performance." />
        <button onClick={() => signIn()} className="btn mt-4 block text-center">Login</button>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Manyagi Capital — Bots & Signals</title>
        <meta name="description" content="Trend & mean reversion bots, signals via Telegram, verified performance (Myfxbook)." />
        <meta property="og:title" content="Manyagi Capital — Bots & Signals" />
        <meta property="og:description" content="Trend & mean reversion bots, signals via Telegram, verified performance (Myfxbook)." />
        <meta property="og:image" content="https://manyagi.net/images/og-capital.jpg" />
        <meta property="og:url" content="https://manyagi.net/capital" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Trading Systems"
        title="Algorithmic Signals"
        lead="Two strategies: Trend & Mean Reversion. Transparent tracking. Signals delivered via Telegram."
      >
        <Link href="#plans" className="btn">Join Signals</Link>
        <Link href="#proof" className="btn ghost">See Proof</Link>
      </Hero>
      <section id="proof" className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card>
          <h3 className="text-2xl mb-2">Verified Performance</h3>
          <p className="text-muted text-sm mb-4">View our public Myfxbook widgets.</p>
          <iframe
            src="https://www.myfxbook.com/widget/account/YOUR_ACCOUNT_ID"
            width="100%"
            height="360"
            frameBorder="0"
            loading="lazy"
          ></iframe>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Strategy Overview</h3>
          <ul className="text-muted text-sm list-disc pl-5">
            <li><strong>Trend Bot:</strong> Daily trend following, multi-asset.</li>
            <li><strong>Mean Reversion:</strong> Intraday edges around volatility bands.</li>
            <li>Education-first. Signals are not financial advice.</li>
          </ul>
        </Card>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Performance Charts</h3>
        <Image src="/images/performance-chart.png" alt="Performance Chart" width={600} height={400} className="rounded mb-4" />
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Educational Resources</h3>
        <ul className="text-muted text-sm list-disc pl-5">
          <li>Weekly strategy breakdowns</li>
          <li>Risk management guides</li>
          <li>Video tutorials</li>
        </ul>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Testimonials</h3>
        <p className="text-muted mb-2">"Consistent signals, great results!" - Trader A</p>
        <p className="text-muted">"Transparent and educational." - Trader B</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">FAQ</h3>
        <details className="mb-2">
          <summary className="cursor-pointer">What assets are covered?</summary>
          <p className="text-muted text-sm">Crypto, FX, Indices.</p>
        </details>
        <details>
          <summary className="cursor-pointer">Is copy trading available?</summary>
          <p className="text-muted text-sm">In Pro plan, on waitlist.</p>
        </details>
      </section>
      <section id="plans" className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card>
          <h3 className="text-2xl mb-2">Basic Signals</h3>
          <p className="text-muted text-sm mb-4">Telegram alerts: entries, exits, risk notes. Join our Telegram group for real-time signals after subscribing!</p>
          <ul className="text-muted text-sm list-disc pl-5 mb-4">
            <li>$29 / month</li>
            <li>Crypto/FX/Indices</li>
            <li>Weekly recap email</li>
          </ul>
          <p className="text-muted text-sm mb-2">
            Find your Telegram ID by messaging <a href="https://t.me/GetIDsBot" target="_blank" className="text-accent">@GetIDsBot</a>.
          </p>
          <input
            type="text"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            placeholder="Telegram ID (e.g., 123456789)"
            className="w-full p-3 border border-neutral-800 rounded bg-neutral-800 text-white mb-2"
          />
          <button
            onClick={() => handleCheckout('price_1Rwfe5IFtQrr5DjcidsMeAOM')}
            className="btn w-full"
            disabled={loading || !telegramId}
          >
            Subscribe to Basic Signals
          </button>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Pro + Copy (Waitlist)</h3>
          <p className="text-muted text-sm mb-4">Signals + copy trading when track record is live. Join our Telegram group for updates!</p>
          <ul className="text-muted text-sm list-disc pl-5 mb-4">
            <li>$99 / month</li>
            <li>Priority support</li>
            <li>Education library</li>
          </ul>
          <SubscriptionForm
            formId="8432549"
            uid="877716573d"
            title="Join Pro Waitlist"
            description="Get notified when available and join our Telegram group."
            includeTelegramId={true}
          />
        </Card>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Risk Disclaimer</h3>
        <p className="text-muted text-sm">
          Trading involves substantial risk and is not suitable for every investor. Signals are educational and informational only. Past performance does not guarantee future results.
        </p>
        <p className="mt-4 text-muted text-sm">
          Use signals to trade on <Link href="/tech" className="text-accent">Daito app</Link> markets.
        </p>
      </section>
    </>
  );
}