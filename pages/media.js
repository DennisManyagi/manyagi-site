import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

// Helpers to keep things bulletproof
const asList = (v) => {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.items)) return v.items;
  return [];
};

const pickImage = (p) =>
  p?.thumbnail_url ||
  p?.display_image ||
  p?.image_url ||
  p?.image ||
  '';

export default function Media() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products?division=media');
        const json = await res.json();

        const list = asList(json).map((p) => ({
          ...p,
          display_image: pickImage(p),
          // enforce a consistent productType for media
          productType: p.productType || 'download',
        }));

        if (list.length === 0) {
          // Safe fallback so UI still renders
          const fallback = [
            {
              id: 'audio1',
              name: 'Audio Story Collection',
              price: 14.99,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-1.webp',
              division: 'media',
              description: 'Immersive audio stories',
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
        console.error('Media fetch error:', error);
        const fallback = [
          {
            id: 'audio1',
            name: 'Audio Story Collection',
            price: 14.99,
            display_image:
              'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-1.webp',
            division: 'media',
            description: 'Immersive audio stories',
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
    // Force productType to 'download' on add
    const payload = { ...product, productType: 'download' };
    if (!payload.display_image) {
      payload.display_image = pickImage(product);
    }
    dispatch(addToCart(payload));
  };

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-1.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-2.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-3.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-4.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-5.webp',
  ];

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading media products...</div>;
  }

  const list = asList(products);

  return (
    <>
      <Head>
        <title>Manyagi Media — Stories in Motion</title>
        <meta name="description" content="Discover our video and audio storytelling content." />
      </Head>

      <Hero
        kicker="Media"
        title="Stories in Motion"
        lead="Experience our narratives through video and audio."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#products" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Watch Now
        </Link>
      </Hero>

      <section id="products" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        {list.length === 0 ? (
          <div className="col-span-full text-center text-lg">No media items found.</div>
        ) : (
          list.map((product) => (
            <Card
              key={product.id}
              title={product.name}
              description={product.description}
              image={product.display_image || pickImage(product)}
              category="media"
              buyButton={product}
              onBuy={() => handleAddToCart(product)}
            />
          ))
        )}
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427850"
          uid="637df68a03"
          title="Subscribe to Media Updates"
          description="Get notified about new videos and audio releases."
        />
      </section>

      <Recommender />
    </>
  );
}
