// components/StripeCheckout.js
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ product, amount }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });
    if (!error) {
      const response = await fetch('/api/stripe/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id, amount, description: product }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Payment successful!');
      } else {
        alert('Payment failed.');
      }
    } else {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label={`Checkout for ${product}`} className="glass p-4 rounded">
      <div className="mb-4 p-3 border border-gray-300 rounded bg-white">
        <CardElement options={{ style: { base: { color: '#000' } } }} />
      </div>
      <button className="w-full py-2 bg-yellow-500 text-black rounded font-bold hover:bg-yellow-400 hover:scale-105 transition" type="submit">Pay ${(amount / 100).toFixed(2)} for {product}</button>
    </form>
  );
};

const StripeCheckout = ({ product, amount }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm product={product} amount={amount} />
  </Elements>
);

export default StripeCheckout;