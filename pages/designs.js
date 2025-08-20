// pages/designs.js
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useState } from 'react'; // Fixed import: useState from 'react', not 'react-redux'
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function Designs() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false); // Corrected useState syntax from previous fix

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    setShowModal(true);
  };

  return (
    <>
      <Head>
        <title>Manyagi Designs — Wear the Story</title>
        <meta name="description" content="Shop T-shirts, mugs, posters, and NFTs inspired by our books." />
        <meta property="og:title" content="Manyagi Designs — Wear the Story" />
        <meta property="og:description" content="Shop T-shirts, mugs, posters, and NFTs inspired by our books." />
        <meta property="og:image" content="https://manyagi.net/images/og-designs.webp" />
        <meta property="og:url" content="https://manyagi.net/designs" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <section className="hero relative h-96 flex items-center justify-center overflow-hidden bg-white">
        <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" src="/videos/product-video.mp4" />
        <div className="relative z-10 text-center text-black">
          <h1 className="text-5xl font-bold mb-4">New Arrivals</h1>
          <p>Discover our latest designs inspired by stories.</p>
          <Link href="#shop" className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Shop Now</Link>
        </div>
      </section>
      <section id="shop" className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="product bg-gray-100 rounded p-4 hover:shadow-lg">
          <img src="/images/product-image1.webp" alt="Product" className="w-full h-48 object-cover mb-4 hover:scale-105 transition" />
          <h3 className="text-2xl font-bold">T-shirt</h3>
          <p>$29.99</p>
          <button onClick={() => handleAddToCart({ id: '1', name: 'T-shirt', price: 29.99 })} className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Add to Cart</button>
        </div>
        <div className="product bg-gray-100 rounded p-4 hover:shadow-lg">
          <img src="/images/product-image2.webp" alt="Product" className="w-full h-48 object-cover mb-4 hover:scale-105 transition" />
          <h3 className="text-2xl font-bold">Mug</h3>
          <p>$15.99</p>
          <button onClick={() => handleAddToCart({ id: '2', name: 'Mug', price: 15.99 })} className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Add to Cart</button>
        </div>
        <div className="product bg-gray-100 rounded p-4 hover:shadow-lg">
          <img src="/images/product-image3.webp" alt="Product" className="w-full h-48 object-cover mb-4 hover:scale-105 transition" />
          <h3 className="text-2xl font-bold">Poster</h3>
          <p>$19.99</p>
          <button onClick={() => handleAddToCart({ id: '3', name: 'Poster', price: 19.99 })} className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Add to Cart</button>
        </div>
        {/* Add more products as needed */}
      </section>
      <section className="container mx-auto px-4 py-12 prose text-gray-800">
        <h2 className="text-3xl font-bold mb-6">Manyagi Designs: Wear the Inspiration</h2>
        <p className="mb-4">Manyagi Designs transforms our storytelling IP into wearable art and collectibles, blending fantasy aesthetics with modern fashion. Inspired by themes of legacy and hidden strengths, our products allow users to carry the Manyagi spirit in daily life.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Overview</h3>
        <p className="mb-4">Inspired by Publishing IP, Designs offers merch like T-shirts, mugs, posters, NFTs—creative like Redbubble but tied to stories.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Products/Services</h3>
        <p className="mb-4">T-shirts ($29.99), mugs ($15.99), posters ($19.99), NFTs (OpenSea). Global shipping via Printful.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Why Choose Us</h3>
        <p className="mb-4">High-quality, limited drops. Cross-promote with other divisions.</p>
      </section>
      <section className="container mx-auto px-4 py-12">
        <SubscriptionForm formId="8427635" uid="db12290300" title="Subscribe to Designs Updates" description="Get new merch drops, NFT launches, and poster releases." />
      </section>
      {showModal && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="modal-content bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Added to Cart!</h2>
            <p>Item added. Proceed to checkout?</p>
            <Link href="/cart" className="btn bg-purple-600 text-white py-2 px-4 rounded mt-4">Go to Cart</Link>
            <button onClick={() => setShowModal(false)} className="btn bg-gray-300 text-black py-2 px-4 rounded mt-2">Continue Shopping</button>
          </div>
        </div>
      )}
      <Recommender />
    </>
  );
};