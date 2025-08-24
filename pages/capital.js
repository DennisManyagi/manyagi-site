// pages/capital.js
import Head from 'next/head';
import Link from 'next/link';
import SignalsSubscriptionForm from '../components/SignalsSubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';
import { useState } from 'react';

export default function Capital() {
  const [activeTab, setActiveTab] = useState('basics');
  const carouselImages = [
    '/images/chart-hero.webp',
    '/images/performance-chart.png',
  ];

  const tabs = [
    { id: 'basics', title: 'Trading Basics', content: 'Learn the fundamentals of trading with our expert guides.', image: '/images/performance-chart.png' },
    { id: 'strategies', title: 'Strategies', content: 'Explore advanced trading strategies for consistent returns.', image: '/images/chart-hero.webp' },
    { id: 'tools', title: 'Tools', content: 'Discover our trading bots and charting tools.', image: '/images/performance-chart.png' },
  ];

  return (
    <>
      <Head>
        <title>Manyagi Capital — Trading Signals & Bots</title>
        <meta name="description" content="Join our trading signals and bot community for financial success." />
      </Head>
      <Hero
        kicker="Capital"
        title="Trade Smarter with Manyagi Capital"
        lead="Real-time signals and bot-driven insights."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#subscribe" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition">
          Subscribe
        </Link>
      </Hero>
      <section id="signals" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Performance Charts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card
            title="Weekly Performance"
            description="See our latest trading results."
            image="/images/performance-chart.png"
            link="https://myfxbook.com/manyagi"
            category="capital"
            className="text-center"
          >
            <Link href="https://myfxbook.com/manyagi" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition" target="_blank" rel="noopener noreferrer">
              View Myfxbook
            </Link>
          </Card>
          <Card
            title="Bot Insights"
            description="Automated trading with proven results."
            image="/images/chart-hero.webp"
            link="#subscribe"
            category="capital"
            className="text-center"
          >
            <Link href="#subscribe" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition">
              Join Now
            </Link>
          </Card>
        </div>
      </section>
      <section id="education" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Learn Trading</h2>
        <div className="flex gap-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 rounded ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
            >
              {tab.title}
            </button>
          ))}
        </div>
        <Card
          title={tabs.find((tab) => tab.id === activeTab).title}
          description={tabs.find((tab) => tab.id === activeTab).content}
          image={tabs.find((tab) => tab.id === activeTab).image}
          category="capital"
          className="text-center"
        />
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SignalsSubscriptionForm priceId="price_1RzaWkIFtQrr5DjcRBPLRd37" />
      </section>
      <Recommender />
    </>
  );
};