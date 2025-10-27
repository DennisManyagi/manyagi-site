// pages/tech.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

// normalize API response
const asList = (v) => {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.items)) return v.items;
  return [];
};

export default function Tech() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch "tech" showcase items from /api/posts
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/posts?division=tech');
        const json = await res.json();

        // expecting { items: [...] }
        const list = asList(json).map((p) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt || p.content?.slice(0, 140) || '',
          image:
            p.featured_image ||
            p.metadata?.screenshot ||
            'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-placeholder.webp',
          appUrl: p.metadata?.app_url || null,
          appType: p.metadata?.app_type || 'app',
        }));

        if (list.length === 0) {
          // fallback demo card so page never looks empty
          setApps([
            {
              id: 'fallback-daito',
              title: 'Daito Productivity App',
              excerpt:
                'Lightweight productivity and focus companion. Track tasks, lock in, get more done.',
              image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/daito-screenshot.webp',
              appUrl: 'https://example.com/daito',
              appType: 'app',
            },
          ]);
        } else {
          setApps(list);
        }
      } catch (err) {
        console.error('tech fetch error:', err);
        // fallback if API blows up
        setApps([
          {
            id: 'fallback-daito',
            title: 'Daito Productivity App',
            excerpt:
              'Lightweight productivity and focus companion. Track tasks, lock in, get more done.',
            image:
              'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/daito-screenshot.webp',
            appUrl: 'https://example.com/daito',
            appType: 'app',
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-carousel-1.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-carousel-2.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-carousel-3.webp',
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading apps...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Manyagi Tech — Apps & Tools</title>
        <meta
          name="description"
          content="Explore in-house tools, apps, bots, and platforms built by Manyagi Tech."
        />
      </Head>

      <Hero
        kicker="Tech"
        title="Innovate with Manyagi Tech"
        lead="Internal tools, public apps, and experimental platforms."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link
          href="#apps"
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Browse Apps
        </Link>
      </Hero>

      {/* Showcase grid */}
      <section
        id="apps"
        className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {apps.length === 0 ? (
          <div className="col-span-full text-center text-lg">
            No apps yet. Check back soon.
          </div>
        ) : (
          apps.map((app) => (
            <Card
              key={app.id}
              title={
                <div className="space-y-1">
                  <div className="text-lg font-semibold leading-snug">
                    {app.title}
                  </div>
                  <div className="text-[11px] inline-block bg-gray-800 text-white px-2 py-1 rounded uppercase tracking-wide">
                    {app.appType === 'website'
                      ? 'Web'
                      : app.appType === 'review'
                      ? 'Review'
                      : 'App'}
                  </div>
                </div>
              }
              description={app.excerpt || '—'}
              image={app.image}
              category="tech"
            >
              {app.appUrl ? (
                <a
                  href={app.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-sm font-semibold inline-block"
                >
                  Visit / Download
                </a>
              ) : (
                <span className="text-xs opacity-70">
                  Coming soon
                </span>
              )}
            </Card>
          ))
        )}
      </section>

      {/* Email capture for new drops */}
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427849"
          uid="637df68a02"
          title="Get Early Access"
          description="Be first in line for new app betas, tools, and private releases."
        />
      </section>

      {/* Cross promo / recommendations */}
      <Recommender />
    </>
  );
}
