import Head from 'next/head';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart } from '../lib/cartSlice';
import { useState } from 'react';
import Recommender from '../components/Recommender';

export default function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'US',
    zip: '',
  });
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  const handleQuantityChange = (itemId, quantity) => {
    if (quantity < 1) {
      dispatch(removeFromCart(itemId));
    } else {
      const item = cartItems.find(i => i.id === itemId);
      dispatch(addToCart({ ...item, quantity }));
    }
  };

  const handleCheckout = async () => {
    try {
      if (!customerDetails.name || !customerDetails.address || !customerDetails.city || !customerDetails.state || !customerDetails.zip) {
        throw new Error('Please fill in all required fields');
      }

      const stripeRes = await fetch('/api/stripe/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      });
      const stripeData = await stripeRes.json();
      if (!stripeData.sessionId && !stripeData.paymentIntent) {
        throw new Error('Stripe checkout failed');
      }

      const printfulRes = await fetch('/api/printful/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          customer: customerDetails,
        }),
      });
      const printfulData = await printfulRes.json();
      if (!printfulData.orderId) {
        throw new Error('Printful order creation failed');
      }

      window.location.href = stripeData.sessionId ? stripeData.url : 'https://manyagi.net/thank-you';
    } catch (err) {
      setError(err.message);
      setShowModal(true);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <>
      <Head>
        <title>Cart — Manyagi Designs</title>
        <meta name="description" content="Review and checkout your Manyagi Designs merch." />
        <meta property="og:title" content="Cart — Manyagi Designs" />
        <meta property="og:description" content="Review and checkout your Manyagi Designs merch." />
        <meta property="og:image" content="https://manyagi.net/images/og-designs.jpg" />
        <meta property="og:url" content="https://manyagi.net/cart" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <section className="container mx-auto px-4 py-10 glass">
        <h1 className="text-4xl font-bold mb-6 kinetic">Your Cart</h1>
        {cartItems.length === 0 ? (
          <p>
            Your cart is empty.{' '}
            <Link href="/designs" className="text-blue-600 hover:underline hover:scale-105 transition">
              Shop now
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 mb-10">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-xl kinetic">{item.name}</h3>
                    <p className="text-muted">
                      ${item.price.toFixed(2)} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      className="border p-1 w-16 text-center rounded"
                    />
                    <button
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="text-red-600 hover:text-red-800 hover:scale-105 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-right">
                <p className="text-xl font-bold">Total: ${calculateTotal()}</p>
              </div>
            </div>
            <div className="max-w-md mx-auto glass p-4 rounded">
              <h2 className="text-2xl font-bold mb-4 kinetic">Shipping Details</h2>
              <form className="space-y-4">
                {/* Inputs with ARIA labels */}
                <div>
                  <label htmlFor="name" className="block text-sm mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={customerDetails.name}
                    onChange={handleInputChange}
                    className="border p-2 w-full rounded"
                    required
                  />
                </div>
                {/* ... other inputs similar ... */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="btn w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 hover:scale-105 transition"
                >
                  Proceed to Checkout
                </button>
              </form>
            </div>
          </>
        )}
      </section>
      {showModal && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center glass">
          <div className="modal-content bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 kinetic">{error ? 'Error' : 'Checkout Ready'}</h2>
            <p className="mb-4">{error ? error : 'Ready to proceed with payment?'}</p>
            {!error && (
              <Link href="/thank-you" className="btn bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 hover:scale-105 transition">
                Continue to Payment
              </Link>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="btn ghost mt-2 text-gray-600 border border-gray-300 py-2 px-4 rounded hover:bg-gray-100 hover:scale-105 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <Recommender />
    </>
  );
}