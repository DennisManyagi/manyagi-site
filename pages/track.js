// pages/track.js
import Head from 'next/head';
import { useState } from 'react';

export default function Track() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!orderId) {
      setError('Please enter an order ID');
      return;
    }
    try {
      const res = await fetch(`/api/track?order_id=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Not found');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Failed to fetch tracking info');
    }
  };

  return (
    <>
      <Head>
        <title>Track Order — Manyagi</title>
        <meta name="description" content="Look up your Manyagi order status." />
      </Head>
      <section className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
        <form onSubmit={handleLookup} className="flex gap-2 mb-6">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your order ID"
            className="flex-1 p-3 border rounded"
          />
          <button type="submit" className="px-4 py-3 bg-black text-white rounded hover:opacity-90">
            Track
          </button>
        </form>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {result && (
          <div className="border rounded p-4 space-y-2 bg-white">
            <p><strong>Status:</strong> {result.status}</p>
            {result.estimated_delivery && <p><strong>Updated:</strong> {new Date(result.estimated_delivery).toLocaleString()}</p>}
            <p><strong>Division:</strong> {result.division}</p>
            <p><strong>Total:</strong> ${Number(result.total).toFixed(2)}</p>
            <div>
              <strong>Items:</strong>
              <ul className="list-disc ml-6">
                {(result.items || []).map((i, idx) => (
                  <li key={idx}>{i.name} x {i.quantity || 1}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
