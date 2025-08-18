import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import StripeCheckout from '../components/StripeCheckout';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import Image from 'next/image';
import { Carousel } from 'react-responsive-carousel';

export default function Designs() {
  const dispatch = useDispatch();

  const productImages = [
    '/images/mock-tee-1.jpg',
    '/images/mock-print-1.jpg',
    '/images/mock-mug-1.jpg',
  ];

  return (
    <>
      <Head>
        <title>Manyagi Designs — Merch & Art</title>
        <meta name="description" content="Transform ideas into wearable art and collectibles. Our merch is inspired by captivating stories, perfect for fans and creators." />
        <meta property="og:title" content="Manyagi Designs — Merch & Art" />
        <meta property="og:description" content="Transform ideas into wearable art and collectibles. Our merch is inspired by captivating stories, perfect for fans and creators." />
        <meta property="og:image" content="/images/og-designs.jpg" />
        <meta property="og:url" content="https://manyagi.net/designs" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Merch & Prints"
        title="Wear the Story"
        lead="Transform ideas into wearable art and collectibles. Our merch is inspired by captivating stories, perfect for fans and creators."
      >
        <Link href="#products" className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">View Products</Link>
      </Hero>
      <section className="my-10">
        <Carousel autoPlay interval={5000} showThumbs={false} infiniteLoop>
          {productImages.map((img, i) => (
            <Image key={i} src={img} alt={`Product ${i+1}`} width={600} height={400} className="rounded" />
          ))}
        </Carousel>
      </section>
      <section id="products" className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card>
          <Image src="/images/mock-tee-1.jpg" alt="T-shirt Mockup" width={300} height={300} className="rounded mb-4" />
          <h3 className="text-2xl mb-2 text-black">Featured T-shirt ($29.99)</h3>
          <button onClick={() => dispatch(addToCart({ id: 'tee1', name: 'T-shirt', price: 29.99 }))} className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400 mb-2">Add to Cart</button>
          <StripeCheckout product="T-shirt" amount={2999} />
        </Card>
        <Card>
          <Image src="/images/mock-mug-1.jpg" alt="Mug Mockup" width={300} height={300} className="rounded mb-4" />
          <h3 className="text-2xl mb-2 text-black">Featured Mug ($15.99)</h3>
          <button onClick={() => dispatch(addToCart({ id: 'mug1', name: 'Mug', price: 15.99 }))} className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400 mb-2">Add to Cart</button>
          <StripeCheckout product="Mug" amount={1599} />
        </Card>
        <Card>
          <Image src="/images/mock-print-1.jpg" alt="Poster Mockup" width={300} height={300} className="rounded mb-4" />
          <h3 className="text-2xl mb-2 text-black">Featured Poster ($19.99)</h3>
          <button onClick={() => dispatch(addToCart({ id: 'poster1', name: 'Poster', price: 19.99 }))} className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400 mb-2">Add to Cart</button>
          <StripeCheckout product="Poster" amount={1999} />
        </Card>
      </section>
      <section className="my-10">
        <Card>
          <h3 className="text-2xl mb-4 text-black">NFT Collection</h3>
          <p className="text-gray-600">View on OpenSea.</p>
        </Card>
      </section>
      <section className="my-10">
        <Card>
          <SubscriptionForm formId="8432506" uid="a194031db7" title="Get Drop Alerts" description="Join for exclusive discounts." />
        </Card>
      </section>
    </>
  );
}