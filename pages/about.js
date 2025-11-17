import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import SectionIntro from '../components/SectionIntro';
import Card from '../components/Card';

export default function About() {
  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-about.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/team-photo.webp',
  ];

  return (
    <>
      <Head>
        <title>About Manyagi — Creativity Meets Innovation</title>
        <meta
          name="description"
          content="Manyagi is a multi-division brand uniting creativity, technology, design, and digital culture under one vision."
        />
      </Head>

      {/* HERO */}
      <Hero
        kicker="About Manyagi"
        title="Creativity Meets Innovation."
        lead="A modern, multi-division brand where storytelling, digital products, and design work together under one unified vision."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link
          href="#divisions"
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-sm font-semibold"
        >
          Explore Our Divisions
        </Link>
      </Hero>

      {/* BRAND OVERVIEW */}
      <SectionIntro
        id="story"
        kicker="A Unified Vision"
        title="Who We Are"
        lead="Manyagi is a creative-led, innovation-focused company building meaningful products, stories, and digital experiences."
        tone="neutral"
        align="center"
      >
        <p className="text-sm md:text-base mt-3 max-w-3xl mx-auto">
          From digital platforms and creative publishing to apparel, media, and future-facing technology,
          Manyagi brings ideas to life in ways that feel thoughtful, refined, and built for the long term.
        </p>
      </SectionIntro>

      {/* DIVISION OVERVIEW GRID */}
      <SectionIntro
        id="divisions"
        kicker="A Manyagi Company"
        title="Our Divisions"
        lead="Each division contributes to a connected ecosystem built on quality, innovation, and culture."
        tone="card"
        align="center"
      />

      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          <Card
            title="Publishing"
            description="Stories, literature, and creative works that inspire imagination and explore new worlds."
            image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/publishing.webp"
            category="publishing"
          >
            <p className="text-xs text-gray-500 font-mono">publishing@manyagi.net</p>
          </Card>

          <Card
            title="Designs"
            description="Visual identities, apparel, and branded assets that give ideas a distinct and memorable look."
            image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/designs.webp"
            category="designs"
          >
            <p className="text-xs text-gray-500 font-mono">designs@manyagi.net</p>
          </Card>

          <Card
            title="Tech"
            description="Digital experiences, platforms, and apps built with a focus on usability, community, and modern innovation."
            image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/app-carousel-1.webp"
            category="tech"
          >
            <p className="text-xs text-gray-500 font-mono">tech@manyagi.net</p>
          </Card>

          <Card
            title="Media"
            description="Video, audio, and visual storytelling tailored for today’s digital-first audiences."
            image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/media.webp"
            category="media"
          >
            <p className="text-xs text-gray-500 font-mono">media@manyagi.net</p>
          </Card>

          <Card
            title="Capital"
            description="A forward-looking division focused on financial literacy, stewardship, and sustainable growth principles."
            image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/capital.webp"
            category="capital"
          >
            <p className="text-xs text-gray-500 font-mono">capital@manyagi.net</p>
          </Card>

          <Card
            title="Realty"
            description="Exploring real estate and future physical spaces that complement our digital ecosystem."
            image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/realty.webp"
            category="realty"
          >
            <p className="text-xs text-gray-500 font-mono">realty@manyagi.net</p>
          </Card>
        </div>
      </section>

      {/* BRAND VALUES */}
      <SectionIntro
        id="values"
        kicker="Our Values"
        title="What We Stand For"
        lead="Principles that guide how we build, collaborate, and show up across every division."
        tone="neutral"
        align="center"
      />

      <section className="container mx-auto px-4 pb-20">
        {/* Center the row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto text-sm md:text-base">
          <div className="rounded-3xl border bg-white/90 dark:bg-gray-950/90 p-5 shadow-sm text-center">
            <h3 className="font-semibold mb-2">Integrity</h3>
            <p>We build with honesty, clarity, and consistency.</p>
          </div>

          <div className="rounded-3xl border bg-white/90 dark:bg-gray-950/90 p-5 shadow-sm text-center">
            <h3 className="font-semibold mb-2">Innovation</h3>
            <p>We use modern tools, thoughtful design, and long-term thinking.</p>
          </div>

          <div className="rounded-3xl border bg-white/90 dark:bg-gray-950/90 p-5 shadow-sm text-center">
            <h3 className="font-semibold mb-2">Community</h3>
            <p>We build products and stories that connect people and ideas.</p>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <SectionIntro
        id="contact"
        kicker="Reach Out"
        title="Get in Touch"
        lead="Have a project, question, or collaboration idea? We’d love to hear from you."
        tone="card"
        align="center"
        maxWidth="max-w-2xl"
      >
        <p className="text-xs text-gray-500 font-mono">contact@manyagi.net</p>
      </SectionIntro>

      {/* NEWSLETTER */}
      <section id="subscribe" className="container mx-auto px-4 pt-4 pb-16">
        <SubscriptionForm
          formId="8427853"
          uid="637df68a06"
          title="Stay Connected"
          description="Get updates, releases, and highlights from across the Manyagi ecosystem."
        />
      </section>

      <Recommender />
    </>
  );
}
