// pages/realty.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import RealtyLeadForm from '../components/RealtyLeadForm';

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
        <title>Manyagi Realty — California Rentals, Residential & Commercial</title>
        <meta
          name="description"
          content="Manyagi Realty helps you buy, sell, invest, and stay in story-inspired properties across California, plus short-term rentals managed like an Airbnb pro."
        />
      </Head>

      {/* HERO: Brand + primary CTAs */}
      <Hero
        kicker="Manyagi Realty"
        title="California Realty, Story-Inspired Stays."
        lead="Licensed California real estate, Vegas-seasoned experience, and short-term rentals run like a pro host — all under one boutique brand."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="#properties"
            className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-sm font-semibold"
          >
            Browse Vacation Rentals
          </Link>
          <Link
            href="#work-with-us"
            className="btn bg-white/90 text-gray-900 border border-gray-200 py-2 px-4 rounded hover:bg-white transition text-sm font-semibold"
          >
            Work With a Realtor
          </Link>
        </div>
      </Hero>

      {/* SERVICES STRIPE: Residential / Commercial / STR Mgmt */}
      <section className="container mx-auto px-4 pt-12 pb-4">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 dark:bg-gray-900/80 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-1">Residential Buyers & Sellers</h3>
            <p className="text-sm opacity-80 mb-3">
              Single-family homes, condos, and townhomes across California. From first-time
              buyers to move-up sellers, we handle search, pricing, negotiations, and closing.
            </p>
            <ul className="text-xs space-y-1 opacity-80">
              <li>• Home search & private showings</li>
              <li>• Listing prep, pricing, and marketing</li>
              <li>• Offer strategy & negotiation</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/80 dark:bg-gray-900/80 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-1">Small Commercial & Investors</h3>
            <p className="text-sm opacity-80 mb-3">
              Small multifamily, mixed-use, and light commercial. Ideal for investors who care
              about cash flow, appreciation, and long-term wealth.
            </p>
            <ul className="text-xs space-y-1 opacity-80">
              <li>• Deal sourcing & underwriting support</li>
              <li>• Rent comps & revenue projections</li>
              <li>• 1031-friendly timelines & referrals</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/80 dark:bg-gray-900/80 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-1">Short-Term Rental & Airbnb Ops</h3>
            <p className="text-sm opacity-80 mb-3">
              From Big Bear to SoCal, we manage furnished stays like a full-time host — so you
              don’t touch guest messages, cleaners, or dynamic pricing.
            </p>
            <ul className="text-xs space-y-1 opacity-80">
              <li>• Airbnb / VRBO management</li>
              <li>• Calendar sync and cleaner-friendly ops</li>
              <li>• Revenue optimization & reviews strategy</li>
            </ul>
          </div>
        </div>
      </section>

      {/* RENTALS GRID */}
      <section
        id="properties"
        className="container mx-auto px-4 py-16"
      >
        <header className="max-w-2xl mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Stays & Rentals</h2>
          <p className="text-sm md:text-base opacity-80">
            Every booking comes with clear communication, cleaner-friendly schedules, and
            transparent pricing. As we add more properties, they’ll all appear here.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                  prop.description || 'Premium rental property experience.'
                }
                image={prop.display_image}
                category="realty"
              >
                <div className="mt-4 flex items-center justify-between gap-2">
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
                  {prop.metadata?.location && (
                    <span className="text-[11px] opacity-70">
                      {prop.metadata.location}
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* BUY / SELL / MANAGEMENT LEAD BLOCK */}
      <section
        id="work-with-us"
        className="container mx-auto px-4 pb-16"
      >
        <div className="rounded-3xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 dark:from-amber-400 dark:via-amber-500 dark:to-orange-500 px-6 py-10 md:px-10 md:py-12 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="space-y-4 text-gray-900">
              <p className="uppercase tracking-[0.2em] text-xs font-semibold">
                Manyagi Realty · California
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold">
                Buying, selling, or need management in California?
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                Boutique representation powered by a licensed California Realtor® with
                roots in the Las Vegas market. Whether you&apos;re moving in, cashing
                out, or turning a cabin into a high-performing Airbnb, you get one point
                of contact and a full stack of systems behind the scenes.
              </p>
              <ul className="text-sm space-y-1.5">
                <li>• Residential: houses, condos, and townhomes.</li>
                <li>• Small commercial &amp; multifamily for investors.</li>
                <li>• Full-service Airbnb / VRBO setup and management.</li>
                <li>• Off-market conversations for the right opportunities.</li>
              </ul>
              <p className="text-xs opacity-80">
                Based in California with prior licensing and transaction history in Las
                Vegas — experience on both sides of the state line, focused on smart
               , long-term decisions.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-[11px] font-semibold">
                <span className="px-3 py-1 rounded-full bg-white/70">
                  Residential &amp; Commercial
                </span>
                <span className="px-3 py-1 rounded-full bg-white/70">
                  Short-Term Rental Friendly
                </span>
                <span className="px-3 py-1 rounded-full bg-white/70">
                  Investors Welcome
                </span>
              </div>
            </div>

            <div className="max-w-md ml-auto w-full">
              <RealtyLeadForm className="shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter opt-in */}
      <section id="subscribe" className="container mx-auto px-4 pb-16">
        <SubscriptionForm
          formId="8427851"
          uid="637df68a04"
          title="Stay Updated on Realty Listings"
          description="Get notified about new properties, rentals, and investment opportunities."
        />
      </section>

      <Recommender />
    </>
  );
}
