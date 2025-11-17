import Head from 'next/head';
import { useForm, ValidationError } from '@formspree/react';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import SectionIntro from '../components/SectionIntro';

export default function Contact() {
  const [state, handleSubmit] = useForm('xwkdwgdp');

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-contact.webp',
  ];

  return (
    <>
      <Head>
        <title>Contact Manyagi — Get in Touch</title>
        <meta
          name="description"
          content="Reach out to Manyagi for general questions, collaborations, and division-specific inquiries."
        />
      </Head>

      {/* HERO */}
      <Hero
        kicker="Contact"
        title="Get in Touch with Manyagi"
        lead="Questions, ideas, or collaborations — we’d love to hear from you."
        carouselImages={carouselImages}
        height="h-[500px]"
      />

      {/* OVERVIEW / INTRO */}
      <SectionIntro
        id="contact-overview"
        kicker="Start a Conversation"
        title="Talk to the Right Team"
        lead="Use the form below for general inquiries, or reach out directly to a specific division using the emails listed."
        tone="neutral"
        align="center"
        maxWidth="max-w-3xl"
      />

      {/* DIVISION EMAIL GRID */}
      <section className="container mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {/* General */}
          <div className="rounded-2xl border bg-white/90 dark:bg-gray-950/90 p-4 shadow-sm text-center">
            <h3 className="font-semibold mb-1">General</h3>
            <p className="text-xs text-gray-500 mb-2">Questions &amp; inquiries</p>
            <p className="font-mono text-xs break-all">info@manyagi.net</p>
          </div>

          {/* Publishing */}
          <div className="rounded-2xl border bg-white/90 dark:bg-gray-950/90 p-4 shadow-sm text-center">
            <h3 className="font-semibold mb-1">Publishing</h3>
            <p className="text-xs text-gray-500 mb-2">Books, writing, and content</p>
            <p className="font-mono text-xs break-all">publishing@manyagi.net</p>
          </div>

          {/* Designs */}
          <div className="rounded-2xl border bg-white/90 dark:bg-gray-950/90 p-4 shadow-sm text-center">
            <h3 className="font-semibold mb-1">Designs</h3>
            <p className="text-xs text-gray-500 mb-2">Branding, visuals, apparel</p>
            <p className="font-mono text-xs break-all">designs@manyagi.net</p>
          </div>

          {/* Media */}
          <div className="rounded-2xl border bg-white/90 dark:bg-gray-950/90 p-4 shadow-sm text-center">
            <h3 className="font-semibold mb-1">Media</h3>
            <p className="text-xs text-gray-500 mb-2">Video, audio, digital content</p>
            <p className="font-mono text-xs break-all">media@manyagi.net</p>
          </div>

          {/* Tech */}
          <div className="rounded-2xl border bg-white/90 dark:bg-gray-950/90 p-4 shadow-sm text-center">
            <h3 className="font-semibold mb-1">Tech</h3>
            <p className="text-xs text-gray-500 mb-2">Apps, platforms, web projects</p>
            <p className="font-mono text-xs break-all">tech@manyagi.net</p>
          </div>

          {/* Capital */}
          <div className="rounded-2xl border bg-white/90 dark:bg-gray-950/90 p-4 shadow-sm text-center">
            <h3 className="font-semibold mb-1">Capital</h3>
            <p className="text-xs text-gray-500 mb-2">Finance &amp; strategic growth</p>
            <p className="font-mono text-xs break-all">capital@manyagi.net</p>
          </div>

          {/* Realty */}
          <div className="rounded-2xl border bg-white/90 dark:bg-gray-950/90 p-4 shadow-sm text-center">
            <h3 className="font-semibold mb-1">Realty</h3>
            <p className="text-xs text-gray-500 mb-2">Real estate &amp; future spaces</p>
            <p className="font-mono text-xs break-all">realty@manyagi.net</p>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <SectionIntro
        id="form"
        kicker="Contact Form"
        title="Send Us a Message"
        lead="Prefer a single channel? Use this form and we’ll route your note to the right place."
        tone="card"
        align="center"
        maxWidth="max-w-2xl"
      />

      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-xl mx-auto rounded-3xl border bg-white/95 dark:bg-gray-950/95 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <ValidationError prefix="Email" field="email" errors={state.errors} />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <ValidationError
                prefix="Message"
                field="message"
                errors={state.errors}
              />
            </div>

            <button
              type="submit"
              disabled={state.submitting}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {state.submitting ? 'Sending…' : 'Submit'}
            </button>

            {state.succeeded && (
              <p className="mt-2 text-sm text-green-600">
                Thanks for your message — we’ll get back to you soon.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="subscribe" className="container mx-auto px-4 pb-16">
        <SubscriptionForm
          formId="8427853"
          uid="637df68a06"
          title="Stay Connected"
          description="Get updates, releases, and insights from across the Manyagi ecosystem."
        />
      </section>

      <Recommender />
    </>
  );
}
