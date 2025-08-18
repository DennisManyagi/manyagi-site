import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../lib/cartSlice';
import Link from 'next/link';
import StripeCheckout from './StripeCheckout';

const Cart = () => {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gold">Your Cart</h2>
      {items.length === 0 ? (
        <p className="text-muted-foreground mb-4">Cart is empty. <Link href="/designs" className="text-emerald-400 hover:underline">Shop Designs</Link>.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between items-center pb-4 border-b border-neutral-800">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
                <button onClick={() => dispatch(removeFromCart(item.id))} className="text-red-400 hover:text-red-300">Remove</button>
              </li>
            ))}
          </ul>
          <p className="text-right font-bold text-lg mb-4">Total: ${total.toFixed(2)}</p>
          <StripeCheckout amount={total * 100} description="Cart Checkout" items={items} />
        </>
      )}
    </div>
  );
};

export default Cart;