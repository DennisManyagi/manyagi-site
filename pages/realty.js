import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Realty() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetch('/api/products?division=realty').then(r => r.json());
        setProducts(data || []);
      } catch (error) {
        console.error('Realty fetch error:', error);
        setProducts([
          {
            id: 'rental1',
            name: 'Big Bear Luxury Rental',
            price: 299.99,
            image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/rental-bigbear.webp',
            division: 'realty',
            description: 'Luxury cabin in Big Bear',
            productType: 'rental',
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, productType: 'rental' }));
  };

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/rental-bigbear.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-realty.webp',
  ];

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading realty listings...</div>;
  }

  return (
    <>
      <Head>
        <title>Manyagi Realty — Premium Properties</title>
        <meta name="description" content="Explore our premium properties and rentals." />
      </Head>
      <Hero
        kicker="Realty"
        title="Live in Luxury"
        lead="Discover premium properties and rentals."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#properties" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Explore Properties
        </Link>
      </Hero>

      <section id="properties" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        {products.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            description={product.description}
            image={product.image_url}
            category="realty"
            buyButton={product}
            onBuy={() => handleAddToCart(product)}
          />
        ))}
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
