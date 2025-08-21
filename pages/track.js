// pages/track.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Track() {
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/printful/track?order_id=${orderId}`);
      const data = await response.json();
      setOrderDetails(data);
    } catch (error) {
      console.error('Tracking error:', error);
      alert('Failed to track order');
    }
  };

  return (
    <>
      <Head>
        <title>Manyagi — Track Your Order</title>
        <meta name="description" content="Track your Manyagi order status." />
      </Head>
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-5xl font-bold text-center mb-6">Track Your Order</h1>
        <form onSubmit={handleTrack} className="max-w-md mx-auto space-y-4">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID"
            className="w-full p-3 border rounded bg-white text-black"
            required
          />
          <button type="submit" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
            Track Order
          </button>
        </form>
        {orderDetails && (
          <div className="mt-6 bg-gray-100 rounded p-4 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            <p className="text-base">Status: {orderDetails.status}</p>
            <p className="text-base">Estimated Delivery: {orderDetails.estimatedDelivery}</p>
          </div>
        )}
        <p className="text-center text-base mt-4">
          <Link href="/designs" className="text-blue-600 hover:underline">Continue Shopping</Link>
        </p>
      </section>
    </>
  );
};