import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Designs() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const prods = await fetch('/api/products?division=designs').then(r => r.json());
        setProducts(prods || []);
      } catch (e) {
        console.error('Designs fetch error:', e);
        setProducts([
          { id: '1', name: 'Story T-shirt', price: 29.99, image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-tee-1.webp', division: 'designs', description: 'Cool T-shirt inspired by our stories', productType: 'merch' },
          { id: '2', name: 'Story Mug', price: 19.99, image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/mock-mug-1.webp', division: 'designs', description: 'Perfect for your morning coffee', productType: 'merch' },
        ]);
      } finally { setLoading(false); }
    })();
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, productType: 'merch' }));
    setShowModal(true);
    setTimeout(() => setShowModal(false), 2000);
  };

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-1.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-2.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-3.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-4.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/merch-carousel-5.webp',
  ];

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Loading designs...</div>;

  return (
    <>
      <Head>
        <title>Manyagi Designs — Wear Your Story</title>
        <meta name="description" content="Explore T-shirts, mugs, and more inspired by our stories." />
      </Head>
      <Hero kicker="Designs" title="Wear Your Story" lead="Shop T-shirts, mugs, and prints inspired by our narratives." carouselImages={carouselImages} height="h-[600px]">
        <Link href="#products" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">Shop Now</Link>
      </Hero>

      <section id="products" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-5">
        {products.map((product) => (
          <Card key={product.id} title={product.name} description={product.description} image={product.image_url} category="designs" buyButton={product} onBuy={() => handleAddToCart(product)} />
        ))}
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm formId="8432506" uid="a194031db7" title="Stay Updated on New Designs" description="Get notified about new drops and exclusive offers." />
      </section>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p className="text-base">Added to cart!</p>
            <Link href="/cart" className="text-blue-600 hover:underline mt-4 inline-block">View Cart</Link>
          </div>
        </div>
      )}

      <Recommender />
    </>
  );
}
