import Head from 'next/head';
import CartComponent from '../components/Cart';

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