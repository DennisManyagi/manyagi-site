// components/Cart.js
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '@/lib/cartSlice';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import Recommender from './Recommender';
import { useState, useEffect } from 'react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  { automaticMode: 'auto' }
);

// Pick best available image, fallback safe
function lineItemImageSrc(item) {
  return (
    item.thumbnail_url ||
    item.display_image ||
    item.image_url ||
    item.thumbnail ||
    item.image ||
    item?.product?.thumbnail_url ||
    item?.product?.image_url ||
    '/placeholder.png'
  );
}

const Cart = () => {
  const items = useSelector((state) => state.cart.items || []);
  const dispatch = useDispatch();

  // we'll still let user type an email so we can prefill Stripe Checkout session
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // show running total
  const total = Array.isArray(items)
    ? items.reduce(
        (acc, item) =>
          acc + Number(item.price || 0) * (item.quantity || 1),
        0
      )
    : 0;

  // ---- helper: get affiliate code from localStorage
  const [affiliateCode, setAffiliateCode] = useState(null);
  useEffect(() => {
    try {
      const ref = window.localStorage.getItem('affiliate_ref');
      if (ref) setAffiliateCode(ref);
    } catch {
      /* ignore */
    }
  }, []);

  // ---- MAIN CHECKOUT HANDLER
  const handleCheckout = async () => {
    setError('');

    // must have at least 1 item
    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }

    // 🔒 current backend assumes ONE product per checkout session
    if (items.length > 1) {
      setError(
        'Please checkout one item at a time (we only support single-item checkout right now).'
      );
      return;
    }

    const cartItem = items[0];
    const quantity = cartItem.quantity || 1;

    // special case: Realty bookings should NOT go through create-session,
    // they should already be using /api/realty/book from the property page.
    // If somehow a realty item is in the cart, bail with a message.
    if (cartItem.division === 'realty') {
      setError(
        'This stay needs to be booked from the property page. Please return to the listing to finish checkout.'
      );
      return;
    }

    // normal merch / digital / etc -> /api/checkout/create-session
    try {
      const stripe = await stripePromise;

      // we POST to create-session so it can:
      // - create Stripe Checkout Session
      // - insert pending row in orders
      // - include affiliate_code
      const resp = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: cartItem.id,        // required
          quantity,                       // default 1
          mode: undefined,                // NOT "subscription" (this is one-time)
          email: email || undefined,      // optional convenience
          affiliate_code: affiliateCode || null, // <-- 🔥 pass affiliate
        }),
      });

      const data = await resp.json();

      if (!resp.ok || data.error) {
        console.error('checkout create-session error:', data.error);
        setError(
          data.error ||
            'Checkout could not start. This product may be missing Stripe config.'
        );
        return;
      }

      if (data.url) {
        // just bounce to Stripe Checkout
        window.location.href = data.url;
        return;
      }

      // Backup path: if for some reason url isn't present
      setError('Checkout session did not return a redirect URL.');
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An error occurred during checkout.');
    }
  };

  return (
    <div className="card max-w-2xl mx-auto bg-white text-black glass py-10">
      <h2 className="text-3xl font-bold mb-6">Your Cart</h2>

      {/* CART EMPTY STATE */}
      {items.length === 0 ? (
        <p className="text-gray-600 text-base mb-4">
          Cart is empty.{` `}
          <Link
            href="/designs"
            className="text-blue-600 hover:underline"
          >
            Shop Designs
          </Link>
          .
        </p>
      ) : (
        <>
          {/* LINE ITEMS */}
          <ul className="space-y-4 mb-6">
            {Array.isArray(items) &&
              items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center pb-4 border-b border-gray-300"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={lineItemImageSrc(item)}
                      alt={item.name || 'Product image'}
                      className="w-[100px] h-[100px] object-cover rounded bg-gray-100"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.png';
                      }}
                    />
                    <div>
                      <div className="text-base font-medium">
                        {item.name}{' '}
                        <span className="opacity-70 text-sm">
                          ({item.division || 'site'})
                        </span>
                      </div>

                      <input
                        type="number"
                        value={item.quantity || 1}
                        min="1"
                        onChange={(e) =>
                          dispatch(
                            updateQuantity({
                              id: item.id,
                              quantity:
                                parseInt(e.target.value, 10) || 1,
                            })
                          )
                        }
                        className="w-16 p-1 border rounded mt-2"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base">
                      $
                      {(
                        Number(item.price || 0) *
                        (item.quantity || 1)
                      ).toFixed(2)}
                    </div>

                    <button
                      onClick={() =>
                        dispatch(removeFromCart(item.id))
                      }
                      className="text-red-500 hover:text-red-600 text-sm mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
          </ul>

          {/* TOTAL */}
          <p className="text-right font-bold text-base mb-4">
            Total: ${total.toFixed(2)}
          </p>

          {/* OPTIONAL EMAIL PREFILL */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (for receipt / delivery)"
            className="w-full p-3 border rounded bg-white text-black mb-3"
          />

          {/* affiliate note (read-only visual cue) */}
          {affiliateCode ? (
            <div className="text-xs text-green-700 bg-green-100 border border-green-300 rounded p-2 mb-3">
              Referred by code <strong>{affiliateCode}</strong> — this
              purchase will be credited.
            </div>
          ) : null}

          {/* ERRORS */}
          {error && (
            <p className="text-red-500 text-base mb-3">{error}</p>
          )}

          {/* CHECKOUT BUTTON */}
          <button
            onClick={handleCheckout}
            className="btn bg-black text-white py-4 px-6 rounded w-full hover:scale-105 transition"
          >
            Checkout
          </button>

          <Recommender />
        </>
      )}
    </div>
  );
};

export default Cart;
