import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';
import { supabaseAdmin } from '@/lib/supabase';

export default function Media() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('division', 'media')
        .eq('status', 'active');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Media fetch error:', error);
      setProducts([
        {
          id: 'audio1',
          name: 'Audio Story Collection',
          price: 14.99,
          image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/video-carousel-1.webp',
          division: 'media',
          description: 'Immersive audio stories',
          productType: 'download',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, productType: 'download' }));
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
        {products.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            description={product.description}
            image={product.image_url}
            category="media"
            buyButton={product}
            onBuy={() => handleAddToCart(product)}
          />
        ))}
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