// pages/events.js
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';

function formatRange(startISO, endISO) {
  if (!startISO && !endISO) return 'Date TBA';

  const start = startISO ? new Date(startISO) : null;
  const end = endISO ? new Date(endISO) : null;

  const fmt = (d) =>
    d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  if (start && end) {
    return `${fmt(start)} → ${fmt(end)}`;
  }
  if (start && !end) {
    return fmt(start);
  }
  return fmt(end);
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // could later add filter like "tech", "media", etc.
  const [divisionFilter, setDivisionFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const qs =
          divisionFilter === 'all'
            ? 'upcoming=1'
            : `division=${encodeURIComponent(
                divisionFilter
              )}&upcoming=1`;

        const res = await fetch(`/api/events?${qs}`);
        const json = await res.json();
        setEvents(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error('events load error:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [divisionFilter]);

  const heroImages = [
    // totally optional, reuse anything from storage so the hero feels alive
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-3.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-carousel-1.webp',
  ];

  return (
    <>
      <Head>
        <title>Manyagi Events — Live Drops & Appearances</title>
        <meta
          name="description"
          content="Launches, signings, demos, reveals, and appearances across Manyagi divisions."
        />
      </Head>

      <Hero
        kicker="Events"
        title="Live Drops & Appearances"
        lead="See what's coming next across Realty, Media, Capital, and Tech."
        carouselImages={heroImages}
        height="h-[400px]"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setDivisionFilter('all')}
            className={`px-4 py-2 rounded text-sm font-semibold ${
              divisionFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            All
          </button>

          <button
            onClick={() => setDivisionFilter('tech')}
            className={`px-4 py-2 rounded text-sm font-semibold ${
              divisionFilter === 'tech'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Tech
          </button>

          <button
            onClick={() => setDivisionFilter('media')}
            className={`px-4 py-2 rounded text-sm font-semibold ${
              divisionFilter === 'media'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Media
          </button>

          <button
            onClick={() => setDivisionFilter('capital')}
            className={`px-4 py-2 rounded text-sm font-semibold ${
              divisionFilter === 'capital'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Capital
          </button>

          <button
            onClick={() => setDivisionFilter('realty')}
            className={`px-4 py-2 rounded text-sm font-semibold ${
              divisionFilter === 'realty'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Realty
          </button>
        </div>
      </Hero>

      <section className="container mx-auto px-4 py-16 max-w-4xl">
        {loading ? (
          <div className="text-center text-lg">
            Loading upcoming events…
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-lg opacity-70">
            No upcoming events.
          </div>
        ) : (
          <ul className="space-y-6">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm"
              >
                {/* Title + division badge */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h2 className="text-xl font-bold text-black dark:text-white">
                    {ev.title || 'Untitled Event'}
                  </h2>
                  <span className="text-[11px] px-2 py-1 rounded bg-black text-white dark:bg-gray-700 dark:text-white font-semibold uppercase tracking-wide">
                    {ev.division || 'site'}
                  </span>
                </div>

                {/* Time range */}
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                  {formatRange(ev.start_date, ev.end_date)}
                </div>

                {/* Description */}
                {ev.description && (
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line mb-3">
                    {ev.description}
                  </p>
                )}

                {/* Optional location/map if provided in metadata */}
                {ev.metadata &&
                  typeof ev.metadata.location === 'string' &&
                  ev.metadata.location.trim().length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-semibold mb-1">
                        Location
                      </div>
                      <div className="w-full h-48 bg-gray-200 rounded overflow-hidden border border-gray-300 dark:border-gray-700">
                        <iframe
                          className="w-full h-full"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            ev.metadata.location
                          )}&output=embed`}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                      <div className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
                        {ev.metadata.location}
                      </div>
                    </div>
                  )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
