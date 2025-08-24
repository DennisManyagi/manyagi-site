// components/SignalsSubscriptionForm.js
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const SignalsSubscriptionForm = ({ priceId }) => {
  const [email, setEmail] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email, telegramId }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Failed to start subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 glass p-4 rounded">
      <h3 className="text-2xl font-bold text-black">Subscribe to Basic Signals</h3>
      <p className="text-gray-600 text-base">Unlock daily signals for $29/month. Get Telegram alerts after payment.</p>
      <form onSubmit={handleSubscribe} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          className="w-full p-3 border border-gray-300 rounded bg-white text-black"
          required
        />
        <input
          type="number"
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
          placeholder="Telegram ID (e.g., 123456789) - Find via @userinfobot"
          className="w-full p-3 border border-gray-300 rounded bg-white text-black"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-yellow-500 text-black rounded font-bold hover:bg-yellow-400 hover:scale-105 transition"
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>
        {error && <p className="text-red-500 text-base">{error}</p>}
      </form>
      <p className="text-sm text-gray-600">Payments processed securely via Stripe. Cancel anytime.</p>
    </div>
  );
};

export default SignalsSubscriptionForm;