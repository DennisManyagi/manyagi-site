import Head from 'next/head';
import CartComponent from '../components/Cart'; // Rename to avoid conflict

export default function CartPage() {
  return (
    <>
      <Head>
        <title>Cart - Manyagi</title>
      </Head>
      <CartComponent />
    </>
  );
}