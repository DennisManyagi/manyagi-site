// pages/designs.js
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import { useState } from 'react';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import Card from '../components/Card';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Designs() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  const products = [
    { id: '1', name: 'Story T-shirt', price: 29.99, stripePriceId: 'price_1', image: '/images/mock-tee-1.webp', description: 'Soft cotton tee inspired by Legacy of the Hidden Clans.' },
    { id: '2', name: 'Story Mug', price: 19.99, stripePriceId: 'price_2', image: '/images/mock-mug-1.webp', description: 'Ceramic mug with story-inspired design.' },
    { id: '3', name: 'Story Print', price: 39.99, stripePriceId: 'price_3', image: '/images/mock-print-1.webp', description: 'High-quality art print for your space.' },
    { id: '4', name: 'Story Hoodie', price: 49.99, stripePriceId: 'price_4', image: '/images/merch-carousel-1.webp', description: 'Cozy hoodie with bold story graphics.' },
  ];

  const carouselImages = [
    '/images/merch-carousel-1.webp',
    '/images/merch-carousel-2.webp',
    '/images/merch-carousel-3.webp',
    '/images/merch-carousel-4.webp',
    '/images/merch-carousel-5.webp',
  ];

  const handleAddToCart = async (product) => {
    dispatch(addToCart(product));
    setShowModal(true);
    setTimeout(() => setShowModal(false), 2000);
  };

  return (
    <>
      <Head>
        <title>Manyagi Designs — Wear Your Story</title>
        <meta name="description" content="Explore T-shirts, mugs, and more inspired by our stories." />
      </Head>
      <Hero
        kicker="Designs"
        title="Wear Your Story"
        lead="Shop T-shirts, mugs, and prints inspired by our narratives."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#products" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
          Shop Now
        </Link>
      </Hero>
      <section id="products" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-5">
        {products.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            description={product.description}
            image={product.image}
            category="designs"
            className="text-center"
          >
            <p className="text-16px font-bold mb-4">${product.price.toFixed(2)}</p>
            <button
              onClick={() => handleAddToCart(product)}
              className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition"
            >
              Add to Cart
            </button>
          </Card>
        ))}
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8432506"
          uid="a194031db7"
          title="Stay Updated on New Designs"
          description="Get notified about new drops and exclusive offers."
        />
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
};