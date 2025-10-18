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

export default function Tech() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products?division=tech');
        const json = await res.json();
        const list = asList(json).map((p) => ({
          ...p,
          display_image: pickImage(p),
          productType: p.productType || 'download',
        }));
        if (list.length === 0) {
          const fallback = [
            {
              id: 'daito',
              name: 'Daito App License',
              price: 49.99,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/daito-screenshot.webp',
              division: 'tech',
              description: 'Access to Daito productivity app',
              productType: 'download',
            },
          ];
          setProducts(fallback);
          setTotal(fallback.length);
        } else {
          setProducts(list);
          setTotal(Number(json?.total ?? list.length));
        }
      } catch (error) {
        console.error('Tech fetch error:', error);
        const fallback = [
          {
            id: 'daito',
            name: 'Daito App License',
            price: 49.99,
            display_image:
              'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/daito-screenshot.webp',
            division: 'tech',
            description: 'Access to Daito productivity app',
            productType: 'download',
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
    const payload = { ...product, productType: 'download' };
    if (!payload.display_image) payload.display_image = pickImage(product);
    dispatch(addToCart(payload));
  };

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-carousel-1.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-carousel-2.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-carousel-3.webp',
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading tech products...
      </div>
    );
  }

  const list = asList(products);

  return (
    <>
      <Head>
        <title>Manyagi Tech — Innovative Apps</title>
        <meta
          name="description"
          content="Explore our innovative apps for commerce and community."
        />
      </Head>

      <Hero
        kicker="Tech"
        title="Innovate with Manyagi Tech"
        lead="Apps designed for productivity and connection."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link
          href="#products"
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Explore Apps
        </Link>
      </Hero>

      <section
        id="products"
        className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {list.length === 0 ? (
          <div className="col-span-full text-center text-lg">
            No tech products found.
          </div>
        ) : (
          list.map((product) => (
            <Card
              key={product.id}
              title={product.name}
              description={product.description}
              image={product.display_image || pickImage(product)}
              category="tech"
              buyButton={product}
              onBuy={() => handleAddToCart(product)}
            />
          ))
        )}
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427849"
          uid="637df68a02"
          title="Stay Updated on Tech Releases"
          description="Get notified about new apps and updates."
        />
      </section>

      <Recommender />
    </>
  );
}
