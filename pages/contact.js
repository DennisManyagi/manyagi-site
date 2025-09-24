import Head from 'next/head';
import { useForm, ValidationError } from '@formspree/react';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';

export default function Contact() {
  const [state, handleSubmit] = useForm('xwkdwgdp');

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-contact.webp',
  ];

  return (
    <>
      <Head>
        <title>Contact Manyagi — Get in Touch</title>
        <meta name="description" content="Reach out to Manyagi for inquiries and support." />
      </Head>
      <Hero
        kicker="Contact"
        title="Get in Touch"
        lead="Have questions? We're here to help."
        carouselImages={carouselImages}
        height="h-[600px]"
      />

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Contact Form</h2>
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full p-2 border rounded"
              required
            />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium">Message</label>
            <textarea
              id="message"
              name="message"
              className="w-full p-2 border rounded"
              rows="5"
              required
            />
            <ValidationError prefix="Message" field="message" errors={state.errors} />
          </div>
          <button
            type="submit"
            disabled={state.submitting}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Submit
          </button>
          {state.succeeded && <p className="text-green-600">Thanks for your message!</p>}
        </form>
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427853"
          uid="637df68a06"
          title="Stay Connected"
          description="Join our community for updates and insights."
        />
      </section>

      <Recommender />
    </>
  );
}