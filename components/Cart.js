import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../lib/cartSlice';
import Link from 'next/link';
import StripeCheckout from './StripeCheckout';
import Recommender from './Recommender'; // Added for personalization

const Cart = () => {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="card max-w-2xl mx-auto bg-white text-black glass">
      <h2 className="text-3xl font-bold mb-6 text-yellow-500 kinetic">Your Cart</h2>
      {items.length === 0 ? (
        <p className="text-gray-600 mb-4">Cart is empty. <Link href="/designs" className="text-purple-600 hover:underline">Shop Designs</Link>.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-300">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
                <button onClick={() => dispatch(removeFromCart(item.id))} className="text-red-500 hover:text-red-600">Remove</button>
              </li>
            ))}
          </ul>
          <p className="text-right font-bold text-lg mb-4">Total: ${total.toFixed(2)}</p>
          <StripeCheckout amount={total * 100} description="Cart Checkout" items={items} />
        </>
      )}
      <Recommender /> {/* Added personalization */}
    </div>
  );
};

export default Cart;