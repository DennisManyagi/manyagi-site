// pages/realty.js
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Realty() {
  const dispatch = useDispatch();
  const carouselImages = [
    '/images/home-carousel-1.webp',
    '/images/home-carousel-2.webp',
    '/images/home-carousel-3.webp',
  ];

  const rentals = [
    {
      id: '1',
      title: 'Big Bear Cabin',
      description: 'Cozy cabin rented on Airbnb and Booking.com',
      image: '/images/rental-bigbear.webp',
      price: 200,
    },
    {
      id: '2',
      title: 'Mombasa Property 1',
      description: 'Beautiful property in Mombasa',
      image: '/images/rental-mombasa1.webp',
      price: 150,
    },
    {
      id: '3',
      title: 'Mombasa Property 2',
      description: 'Another great property in Mombasa',
      image: '/images/rental-mombasa2.webp',
      price: 150,
    },
    {
      id: '4',
      title: 'Hidden Gem Room',
      description: 'Spare room in a welcoming home',
      image: '/images/book-carousel-4.webp',
      price: 100,
    },
    {
      id: '5',
      title: 'Nairobi Apartment',
      description: 'Modern apartment in Nairobi',
      image: '/images/merch-carousel-1.webp',
      price: 120,
    },
  ];

  const handleRent = (rental) => {
    dispatch(addToCart({ ...rental, productType: 'rental' }));
  };

  return (
    <>
      <Head>
        <title>Manyagi Realty — Real Estate Services</title>
        <meta name="description" content="Buy, sell, or rent with Manyagi Realty in California and beyond." />
      </Head>
      <Hero
        kicker="Realty"
        title="Your Trusted Real Estate Partner"
        lead="Serving Santa Clarita and surrounding areas with expertise since 2022."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#services" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
          Explore Services
        </Link>
      </Hero>
      <section id="about" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">About Manyagi Realty</h2>
        <p className="text-base mb-4">
          Licensed in California (active until end of 2026) and previously in Nevada. Member of Las Vegas REALTORS® (LVR) in Nevada. Current broker: Premier Agent Network.
        </p>
        <p className="text-base mb-4">
          Serving Santa Clarita and Los Angeles areas. Experienced in Henderson, NV. In real estate since September 2022.
        </p>
        <p className="text-base mb-4">California DRE# [INSERT LICENSE NUMBER HERE]</p>
      </section>
      <section id="services" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card
          title="Buyer Services"
          description="Preferred: Help find your dream home without open houses."
          image="/images/chart-hero.webp"
          className="text-center"
        />
        <Card
          title="Seller Services"
          description="List and sell your property, open to open houses."
          image="/images/daito-screenshot.webp"
          className="text-center"
        />
        <Card
          title="Rental Services"
          description="Find or list rentals, direct booking via Stripe."
          image="/images/og-media.webp"
          className="text-center"
        />
      </section>
      <section id="rentals" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        <h2 className="text-3xl font-bold mb-6 col-span-full">Featured Rentals</h2>
        {rentals.map((rental) => (
          <Card
            key={rental.id}
            title={rental.title}
            description={rental.description}
            image={rental.image}
            className="text-center"
            buyButton={{ ...rental, productType: 'rental' }}
          />
        ))}
      </section>
      <section id="resources" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Resources</h2>
        <p className="text-base mb-4">Tips for Buyers: Research the market, get pre-approved for a mortgage.</p>
        <p className="text-base mb-4">Tips for Sellers: Stage your home, price competitively.</p>
        <p className="text-base mb-4">Rental Advice: Check reviews, book direct for best rates.</p>
        <Link href="/blog" className="text-blue-600 hover:underline">Read our Blog for more</Link>
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427635"
          uid="db12290300"
          title="Subscribe to Realty Updates"
          description="Get new listings and market insights."
        />
      </section>
      <Recommender />
    </>
  );
};