// pages/realty.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import RealtyLeadForm from '../components/RealtyLeadForm'; // ✅ NEW import

// pick best image to show on the card
const pickCardImage = (p) =>
  p.image_url ||
  (p.metadata && p.metadata.cover_url) ||
  '/placeholder.png';

export default function RealtyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // load all properties in division=realty
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/realty/property?all=1');
        const json = await res.json();

        // json.properties should be [{id,name,slug,description,nightly_price,image_url,metadata,...}]
        const list = (json.properties || []).map((p) => ({
          ...p,
          display_image: pickCardImage(p),
        }));

        setProperties(list);
      } catch (err) {
        console.error('Realty list fetch error:', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/rental-bigbear.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-realty.webp',
  ];

  return (
    <>
      <Head>
        <title>Manyagi Realty — Premium Properties & Rentals</title>
        <meta
          name="description"
          content="Discover story-inspired stays and premium rentals."
        />
      </Head>

      <Hero
        kicker="Realty"
        title="Story-Inspired Stays"
        lead="Escape to properties that bring our worlds to life."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link
          href="#properties"
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Browse Rentals
        </Link>
      </Hero>

      {/* Rentals grid */}
      <section
        id="properties"
        className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {loading ? (
          <div className="col-span-full text-center text-lg">
            Loading properties...
          </div>
        ) : properties.length === 0 ? (
          <div className="col-span-full text-center text-lg">
            No properties available yet. Check back soon!
          </div>
        ) : (
          properties.map((prop) => (
            <Card
              key={prop.id}
              title={
                <div className="space-y-2">
                  <div className="text-lg font-semibold leading-snug">
                    {prop.name}
                  </div>

                  {prop.nightly_price ? (
                    <div className="inline-block bg-yellow-100 text-yellow-800 text-[11px] font-semibold px-2 py-1 rounded">
                      From ${prop.nightly_price}/night
                    </div>
                  ) : null}
                </div>
              }
              description={
                prop.description ||
                'Premium rental property experience.'
              }
              image={prop.display_image}
              category="realty"
            >
              <div className="mt-4">
                {prop.slug ? (
                  <Link
                    href={`/realty/${prop.slug}`}
                    className="btn bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400 transition text-sm font-semibold"
                  >
                    View Details &amp; Book
                  </Link>
                ) : (
                  <span className="text-xs opacity-70">
                    (no slug set yet, cannot view details)
                  </span>
                )}
              </div>
            </Card>
          ))
        )}
      </section>

      {/* ✅ NEW: Brokerage / Management / Seller Lead Capture */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Buying, selling, or need management in California?
            </h2>
            <p className="text-base opacity-80 leading-relaxed">
              Residential. Commercial. Short-term rentals.
              We’ll help you find the deal, list the asset, or run it
              for you like an Airbnb pro — without you touching messages,
              cleaners, or pricing.
            </p>

            <ul className="text-sm list-disc pl-5 space-y-1 opacity-80">
              <li>Sell your home off-market or on-market.</li>
              <li>Get full-service Airbnb/VRBO management.</li>
              <li>Find cash-flow or lifestyle properties.</li>
            </ul>

            <p className="text-xs opacity-50">
              If you're already under contract with us as a seller,
              your property will appear on this page as a featured
              listing.
            </p>
          </div>

          <div>
            {/* This posts to /api/realty/lead and writes to realty_leads */}
            <RealtyLeadForm />
          </div>
        </div>
      </section>

      {/* Newsletter opt-in stays the same */}
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427851"
          uid="637df68a04"
          title="Stay Updated on Realty Listings"
          description="Get notified about new properties and rentals."
        />
      </section>

      <Recommender />
    </>
  );
}
