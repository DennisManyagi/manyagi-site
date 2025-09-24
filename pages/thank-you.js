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
  const [error, setError] = useState('');
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://manyagi.net';

  const carouselImages = [
    '/images/og-designs.webp',
    '/images/merch-carousel-1.webp',
    '/images/merch-carousel-2.webp',
  ];

  useEffect(() => {
    if (session_id) {
      fetch(`/api/order-details?session_id=${session_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) setError(data.error);
          else setOrderDetails(data);
        })
        .catch(err => {
          console.error('Fetch order details error:', err);
          setError('Failed to fetch order details');
        });
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
        lead={
          error
            ? 'Your purchase is complete, but we couldn’t fetch order details. Check your email for confirmation.'
            : orderDetails
            ? `Your ${orderDetails.plan || 'subscription'} is complete. Check your email for details.`
            : 'Your purchase is complete. Check your email for details.'
        }
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="/designs" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
          Continue Shopping
        </Link>
      </Hero>
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Share Your Purchase</h2>
        {error && <p className="text-red-500 text-base mb-4">{error}</p>}
        {orderDetails && (
          <div>
            <p>Type: {orderDetails.type}</p>
            {orderDetails.type === 'merch' && <p>Track at /track</p>}
            {orderDetails.type === 'download' && <a href="/assets/bot-license.pdf">Download</a>}
            {orderDetails.type === 'book' && <a href="/assets/Legacy_of_the_Hidden_Clans_(Chapter_1)_by_D.N._Manyagi.pdf">Download eBook</a>}
          </div>
        )}
        <div className="flex gap-4 text-lg">
          <a href={`https://x.com/share?url=${encodeURIComponent(site)}`} className="text-blue-600 hover:text-blue-500" aria-label="Share on X">
            <FaTwitter size={24} />
          </a>
          <a href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(site)}`} className="text-blue-600 hover:text-blue-500" aria-label="Share on Facebook">
            <FaFacebook size={24} />
          </a>
          <a href="https://instagram.com/manyagi.official" className="text-blue-600 hover:text-blue-500" aria-label="Instagram">
            <FaInstagram size={24} />
          </a>
        </div>
      </section>
    </>
  );
}
