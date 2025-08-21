// pages/capital.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Capital() {
  const [activeTab, setActiveTab] = useState('basics');

  const tabs = [
    { id: 'basics', title: 'Trading Basics', content: 'Learn the fundamentals of trading with our expert guides.' },
    { id: 'strategies', title: 'Strategies', content: 'Explore advanced trading strategies for consistent returns.' },
    { id: 'tools', title: 'Tools', content: 'Discover our trading bots and charting tools.' },
  ];

  return (
    <>
      <Head>
        <title>Manyagi Capital — Trading Signals & Bots</title>
        <meta name="description" content="Join our trading signals and bot community for financial success." />
      </Head>
      <section className="hero text-center py-8 bg-white">
        <img src="/images/chart-hero.webp" alt="Capital Hero" className="w-full h-[400px] object-cover mb-4" />
        <h1 className="text-4xl font-serif font-bold mb-4">Trade Smarter with Manyagi Capital</h1>
        <p className="text-14px mb-8">Real-time signals and bot-driven insights.</p>
        <Link href="#signals" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition">
          Subscribe
        </Link>
      </section>
      <section id="signals" className="container mx-auto px-4 py-8">
        <h2 className="text-36px font-serif font-bold mb-6">Performance Charts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card bg-gray-100 rounded p-4">
            <img src="/images/performance-chart.png" alt="Performance Chart" className="w-full h-[400px] object-cover mb-4" />
            <h3 className="text-2xl font-serif font-bold">Weekly Performance</h3>
            <p className="text-14px">See our latest trading results.</p>
            <Link href="https://myfxbook.com/manyagi" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition" target="_blank" rel="noopener noreferrer">
              View Myfxbook
            </Link>
          </div>
          <div className="card bg-gray-100 rounded p-4">
            <img src="/images/chart-hero.webp" alt="Bot Chart" className="w-full h-[400px] object-cover mb-4" />
            <h3 className="text-2xl font-serif font-bold">Bot Insights</h3>
            <p className="text-14px">Automated trading with proven results.</p>
            <Link href="#subscribe" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition">
              Join Now
            </Link>
          </div>
        </div>
      </section>
      <section id="education" className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-serif font-bold mb-6">Learn Trading</h2>
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
        <div className="bg-gray-100 rounded p-4">
          <p className="text-14px">{tabs.find((tab) => tab.id === activeTab).content}</p>
        </div>
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-8">
        <SubscriptionForm
          formId="8432549"
          uid="877716573d"
          title="Join Our Trading Community"
          description="Get signals and bot updates via Telegram."
          includeTelegramId
        />
      </section>
      <Recommender />
    </>
  );
};