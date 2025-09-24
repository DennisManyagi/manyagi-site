import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SignalsSubscriptionForm from '../components/SignalsSubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Capital() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const prods = await fetch('/api/products?division=capital').then(r => r.json());
        setProducts(prods || []);
      } catch (e) {
        console.error('Capital fetch error:', e);
        setProducts([
          { id: 'bot1', name: 'Trading Bot License', price: 99.99, image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/bot-license.webp', division: 'capital', description: 'Lifetime access to premium trading bot', productType: 'download' },
        ]);
      } finally { setLoading(false); }
    })();
  }, []);

  const handleAddToCart = (product) => { dispatch(addToCart({ ...product, productType: 'download' })); };

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/chart-hero.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/performance-chart.png',
  ];

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Loading capital products...</div>;

  return (
    <>
      <Head>
        <title>Manyagi Capital — Trading Signals & Bots</title>
        <meta name="description" content="Join our trading signals and bot community for financial success." />
      </Head>
      <Hero kicker="Capital" title="Trade Smarter with Manyagi Capital" lead="Real-time signals and bot-driven insights." carouselImages={carouselImages} height="h-[600px]">
        <Link href="#subscribe" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition">Subscribe</Link>
      </Hero>

      <section id="performance" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Performance Charts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card
            title="Weekly Performance"
            description="See our latest trading results."
            image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/performance-chart.png"
            link="https://www.myfxbook.com/members/Blackkungfu/manyagi-meanpulse/11661957"
            category="capital"
          />
          <Card
            title="Bot Insights"
            description="Automated trading with proven results."
            image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/chart-hero.webp"
            category="capital"
          >
            <Link href="#products" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition">
              Explore Bots
            </Link>
          </Card>
        </div>
      </section>

      <section id="products" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-5">
        {products.map((product) => (
          <Card key={product.id} title={product.name} description={product.description} image={product.image_url} category="capital" buyButton={product} onBuy={() => handleAddToCart(product)} />
        ))}
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SignalsSubscriptionForm priceId="price_1S4H6jEexzgsonTz12345678" />
      </section>

      <Recommender />
    </>
  );
}
