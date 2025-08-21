// components/Cart.js
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../lib/cartSlice';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import Recommender from './Recommender';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const Cart = () => {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    try {
      const response = await fetch('/api/stripe/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
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
          Cart is empty. <Link href="/designs" className="text-blue-600 hover:underline">Shop Designs</Link>.
        </p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-300">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-[100px] h-[100px] object-cover" />
                  <div>
                    <span className="text-base">{item.name}</span>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => dispatch(updateQuantity({ id: item.id, quantity: parseInt(e.target.value) || 1 }))}
                      className="w-16 p-1 border rounded mt-2"
                      min="1"
                    />
                  </div>
                </div>
                <span className="text-base">${(item.price * item.quantity).toFixed(2)}</span>
                <button onClick={() => dispatch(removeFromCart(item.id))} className="text-red-500 hover:text-red-600 text-base">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p className="text-right font-bold text-base mb-4">Total: ${total.toFixed(2)}</p>
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