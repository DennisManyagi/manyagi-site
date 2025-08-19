import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Recommender from '../components/Recommender';

export default function ThankYou() {
  const router = useRouter();
  const { session_id } = router.query;
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (session_id) {
      const fetchOrder = async () => {
        try {
          const response = await fetch(`/api/order-details?session_id=${session_id}`);
          const data = await response.json();
          if (!data.error) {
            setOrderDetails(data);
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      };
      fetchOrder();
    }
  }, [session_id]);

  const shareText = encodeURIComponent(
    orderDetails
      ? `I just bought ${orderDetails.items?.[0]?.name || 'awesome merch'} from @manyagi_designs! Check it out: https://manyagi.net/designs #ManyagiDesigns`
      : 'I just bought awesome merch from @manyagi_designs! Check it out: https://manyagi.net/designs #ManyagiDesigns'
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=https://manyagi.net/designs&quote=${shareText}`;
  const instagramUrl = 'https://www.instagram.com/manyagi_designs';

  return (
    <>
      <Head>
        <title>Thank You — Manyagi Designs</title>
        <meta name="description" content="Thank you for your purchase! Check your email for order confirmation." />
        <meta property="og:title" content="Thank You — Manyagi Designs" />
        <meta property="og:description" content="Thank you for your purchase! Check your email for order confirmation." />
        <meta property="og:image" content="https://manyagi.net/images/og-designs.jpg" />
        <meta property="og:url" content="https://manyagi.net/thank-you" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Thank You"
        title="Order Confirmed!"
        lead={
          orderDetails
            ? `Your purchase of ${orderDetails.items?.[0]?.name || 'merch'} is confirmed. Check your email for details and tracking info.`
            : 'Your purchase is confirmed! Check your email for details and tracking info.'
        }
      >
        <div className="flex flex-col items-center gap-4">
          <Link href="/designs" className="btn bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 hover:scale-105 transition">
            Continue Shopping
          </Link>
          <div className="flex gap-4">
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="btn bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-500 hover:scale-105 transition">
              Share on Twitter/X
            </a>
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 hover:scale-105 transition">
              Share on Facebook
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="btn bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600 hover:scale-105 transition">
              Follow on Instagram
            </a>
          </div>
        </div>
      </Hero>
      <Recommender />
    </>
  );
}