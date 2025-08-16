import Head from 'next/head';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Manyagi</title>
        <meta name="description" content="Contact Manyagi Management for press, partnerships, and inquiry." />
        <meta property="og:title" content="Contact Manyagi" />
        <meta property="og:description" content="Contact Manyagi Management for press, partnerships, and inquiry." />
        <meta property="og:image" content="https://manyagi.net/images/og-contact.jpg" />
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
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" aria-label="Contact form">
            <label htmlFor="name" className="sr-only">Your name</label>
            <input id="name" type="text" name="name" placeholder="Your name" required className="w-full mb-4 p-3 border border-line rounded" />
            <label htmlFor="email" className="sr-only">Email</label>
            <input id="email" type="email" name="email" placeholder="you@domain.com" required className="w-full mb-4 p-3 border border-line rounded" />
            <label htmlFor="message" className="sr-only">Message</label>
            <textarea id="message" name="message" rows="6" placeholder="Message" required className="w-full mb-4 p-3 border border-line rounded"></textarea>
            <button type="submit" className="btn w-full">Send Message</button>
          </form>
        </Card>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Our Offices</h3>
        <p className="text-muted text-sm mb-2">Headquarters: [Your Address, City, Country]</p>
        <p className="text-muted text-sm mb-2">Email: info@manyagi.net</p>
        <p className="text-muted text-sm">Phone: [Your Phone Number]</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">FAQ</h3>
        <details className="mb-2">
          <summary className="cursor-pointer">Response time?</summary>
          <p className="text-muted text-sm">Within 48 hours.</p>
        </details>
      </section>
    </>
  );
}