import Head from 'next/head';
import Cart from '../components/Cart';

export default function CartPage() {
  return (
    <>
      <Head>
        <title>Manyagi — Cart</title>
        <meta name="description" content="Review and checkout your Manyagi Designs." />
      </Head>
      <section className="container mx-auto px-4 py-10">
        <Cart />
      </section>
    </>
  );
};