import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm'; // Added import
import { useState } from 'react';

export default function Capital() {
  const [telegramId, setTelegramId] = useState('');
  const handleCheckout = async (priceId) => {
    console.log('Initiating checkout for:', priceId);
    const res = await fetch('/api/stripe/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, telegramId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const handleBundleSubscribe = async () => {
    console.log('Initiating bundle checkout');
    const res = await fetch('/api/stripe/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: 'price_bundle_001', telegramId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <>
      <Head>
        <title>Manyagi Capital — Trading Signals</title>
        <meta name="description" content="Data-driven Forex and Indices signals. Crypto and Stocks coming soon." />
        <meta property="og:title" content="Manyagi Capital — Trading Signals" />
        <meta property="og:description" content="Data-driven Forex and Indices signals. Crypto and Stocks coming soon." />
        <meta property="og:image" content="https://manyagi.net/images/og-capital.jpg" />
        <meta property="og:url" content="https://manyagi.net/capital" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Trading Signals"
        title="Manyagi Capital"
        lead="Bots deliver trend and mean-reversion signals for Forex and Indices. Crypto and Stocks coming soon."
        carouselImages={['/images/chart-hero.jpg', '/images/performance-chart.png']}
      >
        <button onClick={() => handleCheckout('price_1Rwfe5IFtQrr5DjcidsMeAOM')} className="btn">Subscribe Now ($29/mo)</button>
        <Link href="#join" className="btn ghost">Learn More</Link>
      </Hero>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card>
          <img src="/images/chart-hero.jpg" alt="Featured Signals" className="w-full rounded mb-4" />
          <h3 className="text-2xl mb-2">Forex Signals</h3>
          <p className="text-muted mb-4">Basic ($29/mo) or Pro ($99/mo) signals via Telegram.</p>
          <input
            type="text"
            placeholder="Enter Telegram ID"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            className="border p-2 mb-4 w-full"
          />
          <button onClick={() => handleCheckout('price_1Rwfe5IFtQrr5DjcidsMeAOM')} className="btn">Basic ($29/mo)</button>
          <button onClick={() => handleCheckout('price_1Rwfe5IFtQrr5DjcidsMeAON')} className="btn mt-2">Pro ($99/mo)</button>
          <button onClick={handleBundleSubscribe} className="btn mt-2">Bundle ($150/mo)</button>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Coming Soon</h3>
          <p className="text-muted mb-4">Crypto Signals - Join waitlist for updates.</p>
          <p className="text-muted mb-4">Stock Signals - Join waitlist for updates.</p>
          <Link href="#join" className="btn">Join Waitlist</Link>
        </Card>
      </section>
      <section className="myfxbook-widget my-10">
        <h3 className="text-xl mb-4">Bot Performance</h3>
        <iframe src="[MYFXBOOK_TREND_WIDGET_URL]" width="100%" height="300" frameborder="0"></iframe>
        <iframe src="[MYFXBOOK_MEAN_WIDGET_URL]" width="100%" height="300" frameborder="0"></iframe>
      </section>
      <section className="division-desc prose max-w-3xl mx-auto text-gray-800">
        <h2 className="text-3xl font-bold mb-6">Manyagi Capital: Insights for Wealth</h2>
        <h3 className="text-2xl font-bold mt-6 mb-4">Overview</h3>
        <p className="mb-4">Like TradingView, we provide bots for trend/mean-reversion signals on Forex, Indices. Crypto/Stocks coming soon. Transparent, data-driven.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Products/Services</h3>
        <p className="mb-4">Basic signals ($29/mo), Pro ($99/mo). Bundles ($150/mo with books/merch). Delivered via Telegram post-sub. Crypto/Stocks placeholders: 'Coming Soon'.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Why Choose Us</h3>
        <p className="mb-4">Verified performance (MyFXBook). Cross-promote: Use signals while shopping Daito or reading books for inspiration.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Testimonials</h3>
        <p className="mb-4">"Reliable signals!" - Trader A. "Great education!" - Trader B.</p>
        <p className="mt-6"><button onClick={() => handleCheckout('price_1Rwfe5IFtQrr5DjcidsMeAOM')} className="btn">Subscribe Now</button></p>
        <p className="text-red-600 mt-4">Disclaimer: Not financial advice; risks involved.</p>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto">
        <h3 className="text-xl mb-4">Latest from @manyagi_capital</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/manyagi_capital?ref_src=twsrc%5Etfw">Tweets by manyagi_capital</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
      <section id="join" className="my-10">
        <Card>
          <SubscriptionForm formId="8427635" uid="db12290300" title="Join Capital Waitlist" description="Get updates on Crypto and Stock signals." includeTelegramId={true} /> {/* Added includeTelegramId for cohesion with signals */}
        </Card>
      </section>
    </>
  );
}