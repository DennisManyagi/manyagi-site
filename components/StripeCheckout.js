import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY); // Replace with your Stripe public key

const CheckoutForm = ({ product }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });
    if (!error) {
      // Send paymentMethod.id to your server (add backend endpoint for processing)
      const response = await fetch('/api/stripe/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id, amount: 2900, description: product }), // Example amount in cents
      });
      const data = await response.json();
      console.log(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label={`Checkout for ${product}`}>
      <div className="mb-4 p-3 border border-line rounded">
        <CardElement />
      </div>
      <button className="btn w-full" type="submit">Pay for {product}</button>
    </form>
  );
};

const StripeCheckout = ({ product }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm product={product} />
  </Elements>
);

export default StripeCheckout;