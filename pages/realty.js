import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

// Helpers
const asList = (v) => (Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : []);
const pickImage = (p) => p?.thumbnail_url || p?.display_image || p?.image_url || p?.image || '/placeholder.png';

export default function RealtyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products?division=realty');
        const json = await res.json();
        const list = asList(json).map((p) => ({ ...p, display_image: pickImage(p) }));
        setProperties(list);
      } catch (err) {
        console.error('Realty list fetch error:', err);
        setProperties([]); // fallback to empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/rental-bigbear.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-realty.webp',
  ];

  if (loading) return <div className="text-center py-20">Loading properties...</div>;

  return (
    <>
      <Head>
        <title>Manyagi Realty — Premium Properties & Rentals</title>
        <meta name="description" content="Discover story-inspired stays and premium rentals." />
      </Head>

      <Hero
        kicker="Realty"
        title="Story-Inspired Stays"
        lead="Escape to properties that bring our worlds to life."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#properties" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Browse Rentals
        </Link>
      </Hero>

      <section id="properties" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        {properties.length === 0 ? (
          <div className="col-span-full text-center text-lg">No properties available yet. Check back soon!</div>
        ) : (
          properties.map((prop) => (
            <Card
              key={prop.id}
              title={prop.name}
              description={prop.description || 'Premium rental property'}
              image={prop.display_image}
              category="realty"
            >
              <Link href={`/realty/${prop.slug}`} className="btn bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400 transition">
                View Details & Book
              </Link>
            </Card>
          ))
        )}
      </section>

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