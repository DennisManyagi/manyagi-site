// pages/thank-you.js
import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ThankYou() {
  const router = useRouter();
  const { session_id } = router.query;
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (session_id) {
      fetch(`/api/order-details?session_id=${session_id}`)
        .then(res => res.json())
        .then(data => setOrderDetails(data))
        .catch(err => console.error(err));
    }
  }, [session_id]);

  return (
    <>
      <Head>
        <title>Manyagi — Thank You</title>
        <meta name="description" content="Thank you for your purchase!" />
      </Head>
      <Hero
        kicker="Thank You"
        title="Order Confirmed"
        lead={orderDetails ? `Your ${orderDetails.plan} is complete. Check your email for details.` : "Your purchase is complete. Check your email for details."}
        height="h-[500px]"
      >
        <Link href="/designs" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
          Continue Shopping
        </Link>
      </Hero>
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6">Share Your Purchase</h2>
        <div className="flex gap-4 text-lg">
          <a href="https://x.com/share?url=https://manyagi.com" className="text-blue-600 hover:text-blue-500">
            <FaTwitter size={24} />
          </a>
          <a href="https://facebook.com/sharer/sharer.php?u=https://manyagi.com" className="text-blue-600 hover:text-blue-500">
            <FaFacebook size={24} />
          </a>
          <a href="https://instagram.com/manyagi.official" className="text-blue-600 hover:text-blue-500">
            <FaInstagram size={24} />
          </a>
        </div>
      </section>
    </>
  );
};