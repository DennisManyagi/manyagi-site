import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

// Helpers
const asList = (v) => {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.items)) return v.items;
  return [];
};
const pickImage = (p) =>
  p?.thumbnail_url || p?.display_image || p?.image_url || p?.image || '';

export default function Realty() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products?division=realty');
        const json = await res.json();
        const list = asList(json).map((p) => ({
          ...p,
          display_image: pickImage(p),
          productType: p.productType || 'rental',
        }));
        if (list.length === 0) {
          const fallback = [
            {
              id: 'rental1',
              name: 'Big Bear Luxury Rental',
              price: 299.99,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/rental-bigbear.webp',
              division: 'realty',
              description: 'Luxury cabin in Big Bear',
              productType: 'rental',
            },
          ];
          setProducts(fallback);
          setTotal(fallback.length);
        } else {
          setProducts(list);
          setTotal(Number(json?.total ?? list.length));
        }
      } catch (error) {
        console.error('Realty fetch error:', error);
        const fallback = [
          {
            id: 'rental1',
            name: 'Big Bear Luxury Rental',
            price: 299.99,
            display_image:
              'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/rental-bigbear.webp',
            division: 'realty',
            description: 'Luxury cabin in Big Bear',
            productType: 'rental',
          },
        ];
        setProducts(fallback);
        setTotal(fallback.length);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = (product) => {
    const payload = { ...product, productType: 'rental' };
    if (!payload.display_image) payload.display_image = pickImage(product);
    dispatch(addToCart(payload));
  };

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/rental-bigbear.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-realty.webp',
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading realty listings...
      </div>
    );
  }

  const list = asList(products);

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
        <Link
          href="#properties"
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Explore Properties
        </Link>
      </Hero>

      <section
        id="properties"
        className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {list.length === 0 ? (
          <div className="col-span-full text-center text-lg">
            No realty listings found.
          </div>
        ) : (
          list.map((product) => (
            <Card
              key={product.id}
              title={product.name}
              description={product.description}
              image={product.display_image || pickImage(product)}
              category="realty"
              buyButton={product}
              onBuy={() => handleAddToCart(product)}
            />
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
