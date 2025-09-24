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

export default function Tech() {
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
        .eq('division', 'tech')
        .eq('status', 'active');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Tech fetch error:', error);
      setProducts([
        {
          id: 'daito',
          name: 'Daito App License',
          price: 49.99,
          image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/daito-screenshot.webp',
          division: 'tech',
          description: 'Access to Daito productivity app',
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
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-carousel-1.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-carousel-2.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-carousel-3.webp',
  ];

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading tech products...</div>;
  }

  return (
    <>
      <Head>
        <title>Manyagi Tech — Innovative Apps</title>
        <meta name="description" content="Explore our innovative apps for commerce and community." />
      </Head>
      <Hero
        kicker="Tech"
        title="Innovate with Manyagi Tech"
        lead="Apps designed for productivity and connection."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#products" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Explore Apps
        </Link>
      </Hero>

      <section id="products" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        {products.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            description={product.description}
            image={product.image_url}
            category="tech"
            buyButton={product}
            onBuy={() => handleAddToCart(product)}
          />
        ))}
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