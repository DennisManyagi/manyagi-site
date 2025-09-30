import Head from 'next/head';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [division, setDivision] = useState('all');

  useEffect(() => {
    (async () => {
      let query = supabase.from('products').select('*');
      if (division !== 'all') query = query.eq('division', division);
      const { data } = await query;
      setProducts(data || []);
    })();
  }, [division]);

  const handleBuy = async (productId) => {
    const { data: session } = await supabase.auth.getSession();
    const response = await fetch('/api/stripe/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, userId: session?.session?.user?.id })
    });
    const { url } = await response.json();
    window.location.href = url; // Redirect to Stripe checkout
  };

  return (
    <>
      <Head>
        <title>Products - Manyagi</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Products</h1>
        <select onChange={(e) => setDivision(e.target.value)} className="p-2 border rounded mb-4">
          <option value="all">All Divisions</option>
          <option value="publishing">Publishing</option>
          <option value="designs">Designs</option>
          <option value="capital">Capital</option>
          <option value="tech">Tech</option>
          <option value="media">Media</option>
          <option value="realty">Realty</option>
        </select>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.map((p) => (
            <li key={p.id} className="border p-4 rounded">
              <h2 className="text-2xl">{p.name} - ${p.price} ({p.division})</h2>
              <button
                onClick={() => handleBuy(p.id)}
                className="mt-2 p-2 bg-green-500 text-white rounded"
              >
                Buy Now
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}