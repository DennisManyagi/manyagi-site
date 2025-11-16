// components/SignalsSubscriptionForm.js
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Stripe.js for redirect (kept for future enhancements)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  { automaticMode: 'auto' }
);

/**
 * SignalsSubscriptionForm
 *
 * Props:
 * - priceId       (string, required)  → Stripe price id for this tier
 * - planName      (string, optional)  → e.g. "Crypto Signals"
 * - priceLabel    (string, optional)  → e.g. "$39.99/month"
 * - blurb         (string, optional)  → short description under title
 */
const SignalsSubscriptionForm = ({
  priceId,
  planName = 'Signals',
  priceLabel,
  blurb,
}) => {
  const [email, setEmail] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const effectiveBlurb =
    blurb ||
    `Unlock structured ${planName.toLowerCase()} with clear entries, exits, and Telegram alerts after payment.`;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!priceId) {
        throw new Error(
          'This plan is temporarily unavailable. Please try again later.'
        );
      }

      if (!telegramId || isNaN(Number(telegramId))) {
        throw new Error('Please enter a valid numeric Telegram ID.');
      }

      const resp = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'subscription',
          price_id: priceId,
          email,
          telegramId,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || data.error) {
        throw new Error(data.error || 'Failed to create checkout session.');
      }

      const stripe = await stripePromise; // reserved for future Stripe.js usage
      window.location.href = data.url;
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to start subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 glass p-4 rounded bg-white text-black dark:bg-gray-900 dark:text-gray-100">
      <h3 className="text-xl font-bold">
        Subscribe to {planName}
      </h3>

      {priceLabel && (
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {priceLabel}
        </div>
      )}

      <p className="text-gray-600 text-sm dark:text-gray-300">
        {effectiveBlurb}
      </p>

      <form onSubmit={handleSubscribe} className="space-y-4 mt-2">
        {!priceId && (
          <div className="p-3 rounded bg-yellow-100 text-yellow-800 text-sm">
            Subscription plan is not configured. Add a Stripe price ID for this
            tier in the Capital admin panel.
          </div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          className="w-full p-3 border border-gray-300 rounded bg-white text-black dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          required
        />

        <input
          type="number"
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
          placeholder="Telegram ID (e.g., 123456789) - Find via @userinfobot"
          className="w-full p-3 border border-gray-300 rounded bg-white text-black dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          required
        />

        <button
          type="submit"
          disabled={loading || !priceId}
          className="w-full py-3 px-6 bg-yellow-500 text-black rounded font-bold hover:bg-yellow-400 hover:scale-105 transition disabled:opacity-60"
        >
          {loading ? 'Processing…' : `Subscribe to ${planName}`}
        </button>

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}
      </form>

      <p className="text-xs text-gray-600 dark:text-gray-400">
        Payments processed securely via Stripe. Cancel anytime. Nothing here is
        financial advice; always do your own research and never risk money you
        can’t afford to lose.
      </p>
    </div>
  );
};

export default SignalsSubscriptionForm;
