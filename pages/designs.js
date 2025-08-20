// pages/designs.js
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import { useState } from 'react';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function Designs() {
  const dispatch = useDispatch();
  const [showModal, useState(false);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    setShowModal(true);
  };

  return (
    <>
      <Head>
        <title>Manyagi Designs — Wear the Story</title>
      </Head>
      <section className="hero relative h-96 flex items-center justify-center overflow-hidden bg-white">
        <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" src="/videos/product-video.mp4" />
        <div className="relative z-10 text-center text-black">
          <h1 className="text-5xl font-bold mb-4">New Arrivals</h1>
          <p>Discover our latest designs inspired by stories.</p>
          <Link href="#" className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Shop Now</Link>
        </div>
      </section>
      <section className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="product bg-gray-100 rounded p-4 hover:shadow-lg">
          <img src="/images/product-image1.webp" alt="Product" className="w-full h-48 object-cover mb-4 hover:scale-105 transition" />
          <h3 className="text-2xl font-bold">T-shirt</h3>
          <p>$29.99</p>
          <button onClick={() => handleAddToCart({ id: '1', name: 'T-shirt', price: 29.99 })} className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Add to Cart</button>
        </div>
        {/* Repeat for more products */}
      </section>
      <section className="container mx-auto px-4 py-12">
        <SubscriptionForm formId="8427635" uid="db12290300" title="Subscribe to Designs Updates" description="Get new merch drops." />
      </section>
      {/* Modal for added to cart */}
      <Recommender />
    </>
  );
};