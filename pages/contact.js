// pages/contact.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Contact() {
  const carouselImages = [
    '/images/og-contact.webp',
    '/images/team-photo.webp',
    '/images/community-photo.webp',
  ];

  return (
    <>
      <Head>
        <title>Manyagi — Contact Us</title>
        <meta name="description" content="Get in touch with Manyagi for support or inquiries." />
      </Head>
      <Hero
        kicker="Contact"
        title="Get in Touch"
        lead="We’re here to help with your questions."
        carouselImages={carouselImages}
        height="h-[600px]" // Changed to match designs.js
      >
        <Link href="#form" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
          Contact Us
        </Link>
      </Hero>
      <section id="form" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card
          title="Send Us a Message"
          description="We’re here to answer your questions."
          image="/images/team-photo.webp"
          className="text-center"
        >
          <form action="https://formspree.io/f/mldlvqnj" method="POST" className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="w-full p-3 border rounded bg-white text-black"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="w-full p-3 border rounded bg-white text-black"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              className="w-full p-3 border rounded bg-white text-black"
              rows="5"
              required
            ></textarea>
            <label className="flex items-center gap-2 text-base">
              <input type="checkbox" name="gdpr" required />
              I agree to the <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </label>
            <button type="submit" className="btn bg-blue-600 text-white py-4 px-6 rounded hover:scale-105 transition">
              Submit
            </button>
          </form>
        </Card>
        <Card
          title="Contact Info"
          description="Reach out via email, phone, or visit us."
          image="/images/community-photo.webp"
          className="text-center"
        >
          <p className="text-base mb-4">Email: support@manyagi.com</p>
          <p className="text-base mb-4">Phone: +1 (555) 123-4567</p>
          <p className="text-base mb-4">Address: 123 Manyagi St, Story City, SC 12345</p>
          <h3 className="text-2xl font-bold mb-4">FAQ</h3>
          <div className="space-y-2">
            <p className="text-base font-semibold">Q: How do I track my order?</p>
            <p className="text-base mb-4">A: Visit our <Link href="/track" className="text-blue-600 hover:underline">Track</Link> page.</p>
            <p className="text-base font-semibold">Q: How do I join the trading signals?</p>
            <p className="text-base mb-4">A: Subscribe on the <Link href="/capital" className="text-blue-600 hover:underline">Capital</Link> page.</p>
          </div>
        </Card>
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427635"
          uid="db12290300"
          title="Stay Connected"
          description="Get updates on all things Manyagi."
        />
      </section>
    </>
  );
};