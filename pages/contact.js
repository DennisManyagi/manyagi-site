import Head from 'next/head';
import Hero from '../components/Hero';
import Card from '../components/Card';
import Link from 'next/link';
import { useForm } from '@formspree/react';

export default function Contact() {
  const [state, handleSubmit] = useForm('mldlvqnj');

  if (state.succeeded) {
    return (
      <div className="my-10 text-center">
        <h2 className="text-3xl mb-4 text-black">Thank You!</h2>
        <p className="text-gray-600 mb-4">Your message has been sent. We’ll respond within 48 hours.</p>
        <Link href="/" className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">Return to Home</Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Contact Manyagi</title>
        <meta name="description" content="Contact Manyagi Management for press, partnerships, and inquiry." />
        <meta property="og:title" content="Contact Manyagi" />
        <meta property="og:description" content="Contact Manyagi Management for press, partnerships, and inquiry." />
        <meta property="og:image" content="/images/og-contact.jpg" />
        <meta property="og:url" content="https://manyagi.net/contact" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Get in Touch"
        title="Contact Us"
        lead="For business inquiries, partnerships, or media: email info@manyagi.net or use the form below."
      />
      <section className="my-10">
        <Card>
          <form onSubmit={handleSubmit} aria-label="Contact form">
            <input type="text" name="_gotcha" style={{ display: 'none' }} />
            <label htmlFor="name" className="sr-only">Your name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Your name"
              required
              className="w-full mb-4 p-3 border border-gray-300 rounded bg-white text-black"
            />
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@domain.com"
              required
              className="w-full mb-4 p-3 border border-gray-300 rounded bg-white text-black"
            />
            <label htmlFor="message" className="sr-only">Message</label>
            <textarea
              id="message"
              name="message"
              rows="6"
              placeholder="Message"
              required
              className="w-full mb-4 p-3 border border-gray-300 rounded bg-white text-black"
            ></textarea>
            <button
              type="submit"
              className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400 w-full"
              disabled={state.submitting}
            >
              Send Message
            </button>
          </form>
        </Card>
      </section>
    </>
  );
}