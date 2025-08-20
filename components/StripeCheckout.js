// components/StripeCheckout.js
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ product, amount, items }) => {  // Add items prop
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
        body: JSON.stringify({ paymentMethodId: paymentMethod.id, amount, description: product, items }),  // Add items to body
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

const StripeCheckout = ({ product, amount, items }) => (  // Add items prop
  <Elements stripe={stripePromise}>
    <CheckoutForm product={product} amount={amount} items={items} />  // Pass items
  </Elements>
);

export default StripeCheckout;