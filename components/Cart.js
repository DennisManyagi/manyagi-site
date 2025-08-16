import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../lib/cartSlice';
import Link from 'next/link';

const Cart = () => {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="card">
      <h2 className="text-2xl mb-4">Your Cart</h2>
      {items.length === 0 ? (
        <p className="text-muted">Cart is empty. <Link href="/designs" className="text-accent">Shop now</Link>.</p>
      ) : (
        <>
          <ul>
            {items.map((item) => (
              <li key={item.id} className="flex justify-between mb-2">
                <span>{item.name} x {item.quantity}</span>
                <span>${item.price * item.quantity}</span>
                <button onClick={() => dispatch(removeFromCart(item.id))} className="text-red-500 ml-4">Remove</button>
              </li>
            ))}
          </ul>
          <hr className="my-4" />
          <p className="text-right font-bold">Total: ${total}</p>
          <Link href="/checkout" className="btn mt-4 block text-center">Checkout with Stripe</Link> {/* Add checkout page if needed */}
        </>
      )}
    </div>
  );
};

export default Cart;