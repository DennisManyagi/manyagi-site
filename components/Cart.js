import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '@/lib/cartSlice';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import Recommender from './Recommender';
import { useState } from 'react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  { automaticMode: 'auto' }
);

// --- helpers ---
function lineItemImageSrc(item) {
  return (
    item.thumbnail_url ||               // what your Designs products use
    item.image_url ||                   // legacy / optional
    item.thumbnail ||                   // safety
    item.image ||                       // safety
    item?.product?.thumbnail_url ||     // if you nest product on the item
    item?.product?.image_url ||         // safety
    '/placeholder.png'                  // final fallback (add a small file in /public)
  );
}

const Cart = () => {
  const items = useSelector((state) => state.cart.items || []);
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState({
    address1: '', city: '', state: '', country: 'US', zip: ''
  });
  const [error, setError] = useState('');

  const total = Array.isArray(items)
    ? items.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0)
    : 0;

  const handleCheckout = async () => {
    if (!email) {
      setError('Email required');
      return;
    }
    if (
      items.some(i =>
        i.division === 'designs' ||
        i.division === 'publishing' ||
        i.division === 'realty'
      ) &&
      (!address.address1 || !address.city)
    ) {
      setError('Address required for physical items or rentals');
      return;
    }
    setError('');

    const stripe = await stripePromise;
    try {
      // NOTE: This hits your existing endpoint.
      // If you switch to the new /api/checkout/create-session later,
      // make sure that route accepts multiple items.
      const response = await fetch('/api/stripe/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, email, address }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to initiate checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout');
    }
  };

  return (
    <div className="card max-w-2xl mx-auto bg-white text-black glass py-10">
      <h2 className="text-3xl font-bold mb-6">Your Cart</h2>

      {items.length === 0 ? (
        <p className="text-gray-600 text-base mb-4">
          Cart is empty.{' '}
          <Link href="/designs" className="text-blue-600 hover:underline">
            Shop Designs
          </Link>.
        </p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {Array.isArray(items) && items.map((item) => (
              <li key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-300">
                <div className="flex items-center gap-4">
                  <img
                    src={lineItemImageSrc(item)}
                    alt={item.name || 'Product image'}
                    className="w-[100px] h-[100px] object-cover rounded bg-gray-100"
                    onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                  />
                  <div>
                    <span className="text-base">
                      {item.name} ({item.division})
                    </span>
                    <input
                      type="number"
                      value={item.quantity || 1}
                      onChange={(e) =>
                        dispatch(updateQuantity({
                          id: item.id,
                          quantity: parseInt(e.target.value, 10) || 1
                        }))
                      }
                      className="w-16 p-1 border rounded mt-2"
                      min="1"
                    />
                  </div>
                </div>

                <span className="text-base">
                  ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                </span>

                <button
                  onClick={() => dispatch(removeFromCart(item.id))}
                  className="text-red-500 hover:text-red-600 text-base"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <p className="text-right font-bold text-base mb-4">
            Total: ${total.toFixed(2)}
          </p>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border rounded bg-white text-black mb-2"
            required
          />

          {items.some(i =>
            i.division === 'designs' ||
            i.division === 'publishing' ||
            i.division === 'realty'
          ) && (
            <>
              <input
                type="text"
                value={address.address1}
                onChange={(e) => setAddress({ ...address, address1: e.target.value })}
                placeholder="Address"
                className="w-full p-3 border rounded bg-white text-black mb-2"
              />
              <input
                type="text"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="City"
                className="w-full p-3 border rounded bg-white text-black mb-2"
              />
              <input
                type="text"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                placeholder="State"
                className="w-full p-3 border rounded bg-white text-black mb-2"
              />
              <input
                type="text"
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                placeholder="Country (e.g., US)"
                className="w-full p-3 border rounded bg-white text-black mb-2"
              />
              <input
                type="text"
                value={address.zip}
                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                placeholder="Zip"
                className="w-full p-3 border rounded bg-white text-black mb-2"
              />
            </>
          )}

          {error && <p className="text-red-500">{error}</p>}

          <button
            onClick={handleCheckout}
            className="btn bg-black text-white py-4 px-6 rounded w-full hover:scale-105 transition"
          >
            Checkout
          </button>
        </>
      )}

      <Recommender />
    </div>
  );
};

export default Cart;
