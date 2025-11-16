// pages/tech.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SectionIntro from '../components/SectionIntro';
import TechQuoteForm from '../components/TechQuoteForm';

const asList = (v) => {
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.items)) return v.items;
  return [];
};

const parseList = (v) => {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  if (typeof v === 'string') {
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const pickImage = (p) =>
  p?.featured_image ||
  p?.metadata?.screenshot ||
  'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-placeholder.webp';

export default function Tech() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/posts?division=tech');
        const json = await res.json();

        if (!json.ok) {
          setError(json.error || 'Failed to load Tech showcase items.');
        }

        const list = asList(json);
        const normalized = list.map((p) => {
          const meta = p.metadata || {};
          return {
            id: p.id,
            name: p.title,
            slug: p.slug,
            tagline: meta.tagline || '',
            description: p.content || p.excerpt || '',
            excerpt: p.excerpt || '',
            image: pickImage(p),
            domain: meta.app_url || '',
            appCategory: meta.app_category || 'flagship',
            appType: meta.app_type || 'app',
            status: meta.status || 'Live',
            platforms: parseList(meta.platforms),
            labels: parseList(meta.labels),
          };
        });

        setItems(normalized);
      } catch (e) {
        console.error('Tech fetch error:', e);
        setError(e.message || 'Error loading apps.');
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
        Loading tech apps...
      </div>
    );
  }

  const flagshipApps = items.filter((item) => item.appCategory !== 'upcoming');
  const upcomingApps = items.filter((item) => item.appCategory === 'upcoming');

  return (
    <>
      <Head>
        <title>Manyagi Tech — Apps, Platforms & Custom Builds</title>
        <meta
          name="description"
          content="Manyagi Tech designs and ships real-world apps like Daito, Nexu, and RealKenyans — and builds custom products, websites, and tools for clients."
        />
      </Head>

      {/* HERO */}
      <Hero
        kicker="Tech"
        title="Ship Real Products with Manyagi Tech"
        lead="From delivery apps to community platforms, we build tools that actually get used — and we can build yours too."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="#flagship"
            className="btn bg-white/90 text-gray-900 border border-gray-300 py-2 px-4 rounded hover:bg-gray-50 transition text-sm font-semibold"
          >
            View Our Apps
          </Link>
          <Link
            href="#quote"
            className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-sm font-semibold"
          >
            Start a Project
          </Link>
        </div>
      </Hero>

      {/* FLAGSHIP APPS */}
      <SectionIntro
        id="flagship"
        kicker="Flagship Platforms"
        title="Live Products Built by Manyagi Tech"
        lead="These are real, shipped products — not just case-study mockups. You can visit them today, download the apps, and leave reviews."
        tone="neutral"
        align="center"
      />

      <section className="container mx-auto px-4 pt-4 pb-16">
        {error && (
          <div className="max-w-3xl mx-auto mb-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {flagshipApps.length === 0 ? (
            <div className="col-span-full text-center text-sm opacity-70">
              No flagship apps configured yet. Add Daito, Nexu, RealKenyans,
              and Manyagi.net in the Admin &gt; Tech tab.
            </div>
          ) : (
            flagshipApps.map((app) => (
              <Card
                key={app.id}
                title={app.name}
                description={app.description}
                image={app.image}
                category="tech"
              >
                {app.tagline && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {app.tagline}
                    </p>
                  </div>
                )}

                {app.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {app.labels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-[11px] font-medium text-gray-700 dark:text-gray-200"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                {app.platforms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {app.platforms.map((plat) => (
                      <span
                        key={plat}
                        className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-0.5 text-[11px] text-gray-700 dark:text-gray-200"
                      >
                        {plat}
                      </span>
                    ))}
                  </div>
                )}

                {app.domain ? (
                  <a
                    href={app.domain}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Open Site / Download
                  </a>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Coming soon
                  </span>
                )}

                {app.domain && (
                  <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                    From the site you can find App Store / Google Play links
                    and leave reviews (where available).
                  </p>
                )}
              </Card>
            ))
          )}
        </div>
      </section>

      {/* UPCOMING / LABS */}
      <SectionIntro
        id="labs"
        kicker="Labs"
        title="Upcoming Apps & Experiments"
        lead="A glimpse at what’s currently cooking inside Manyagi Tech. Some of these will ship as standalone apps; others will plug into Daito, Nexu, or RealKenyans."
        tone="card"
        align="center"
      />

      <section className="container mx-auto px-4 pt-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingApps.length === 0 ? (
            <div className="col-span-full text-center text-sm opacity-70">
              No upcoming apps configured yet. Use the Tech admin tab and set
              <code> Category = Upcoming / Labs</code>.
            </div>
          ) : (
            upcomingApps.map((app) => (
              <div
                key={app.id}
                className="rounded-3xl border border-gray-200/80 dark:border-gray-700/80 bg-white/95 dark:bg-gray-950/95 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {app.name}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/40 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-200">
                    {app.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {app.description || app.excerpt}
                </p>
                {(app.labels.length > 0 || app.platforms.length > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {app.labels.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-[11px] text-gray-700 dark:text-gray-200"
                      >
                        {f}
                      </span>
                    ))}
                    {app.platforms.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-0.5 text-[11px] text-gray-700 dark:text-gray-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* WORK WITH US / QUOTE SECTION (BOTTOM, SINGLE COLUMN FORM) */}
      <SectionIntro
        id="quote"
        kicker="Work With Manyagi Tech"
        title="Need a Website, App, or Platform Built?"
        lead="We design, build, and ship web apps, mobile apps, landing pages, and internal tools — with a bias toward fast iteration and real-world usage."
        tone="neutral"
        align="center"
        maxWidth="max-w-2xl"
      >
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This form opens your email client with a full brief prefilled. You can
          also email{' '}
          <a
            href="mailto:tech@manyagi.net"
            className="underline underline-offset-2"
          >
            tech@manyagi.net
          </a>{' '}
          directly.
        </p>
      </SectionIntro>

      <section className="container mx-auto px-4 pt-4 pb-16">
        {/* wide centered card; width controlled here so we can tweak easily */}
        <TechQuoteForm className="max-w-4xl mx-auto" />
      </section>

      {/* EMAIL CAPTURE FOR NEW DROPS */}
      <SectionIntro
        id="subscribe"
        kicker="Stay Ahead"
        title="Get Early Access to New Apps & Betas"
        lead="We quietly test new builds before they go public. Drop your email to get invites, changelogs, and behind-the-scenes updates from Manyagi Tech."
        tone="neutral"
        align="center"
      />

      <section className="container mx-auto px-4 pt-4 pb-16">
        <SubscriptionForm
          formId="8427849"
          uid="637df68a02"
          title="Get Early Access"
          description="Be first in line for new app betas, tools, and private releases."
        />
      </section>

      {/* CROSS-DIVISION RECOMMENDER */}
      <Recommender />
    </>
  );
}
