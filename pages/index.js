// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import { motion } from 'framer-motion';
import Recommender from '../components/Recommender';

export default function Home() {
  return (
    <>
      <Head>
        <title>Manyagi — Innovation • IP • Commerce</title>
        <meta name="description" content="Manyagi unifies Publishing, Designs, Capital, Tech, and Media. Join for drops, chapters, signals, and app launches." />
        <meta property="og:title" content="Manyagi — Innovation • IP • Commerce" />
        <meta property="og:description" content="Manyagi unifies Publishing, Designs, Capital, Tech, and Media. Join for drops, chapters, signals, and app launches." />
        <meta property="og:image" content="https://manyagi.net/images/og-home.webp" />
        <meta property="og:url" content="https://manyagi.net/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Manyagi Management"
        title="Build. Publish. Design. Trade. Launch."
        lead="One HQ powering books & poetry, fashion & art, trading signals, audio & film, and apps like Daito."
        carouselImages={['/images/home-carousel-1.webp', '/images/home-carousel-2.webp', '/images/home-carousel-3.webp']}
      >
        <Link href="https://manyagi.net/assets/Legacy_of_the_Hidden_Clans (Chapter 1)_by D.N. Manyagi.pdf" target="_blank" rel="noopener noreferrer" className="btn">Join the list</Link>
        <Link href="https://manyagi.net/publishing" className="btn ghost">Read Chapter 1</Link>
      </Hero>
      <section className="bento-grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card image="/images/legacy-chapter-1.webp" alt="Featured Publishing" title="Publishing" description="Two novels + poetry. Read the opening chapter and get updates." link="https://manyagi.net/publishing" category="publishing" />
        <Card image="/images/mock-tee-1.webp" alt="Featured Designs" title="Designs" description="Wear our stories with T-shirts, mugs, and posters." link="https://manyagi.net/designs" category="designs" />
        <Card image="/images/chart-hero.webp" alt="Featured Capital" title="Capital" description="Forex signals via bots. Crypto and stocks coming soon." link="https://manyagi.net/capital" category="capital" />
        <Card image="/images/daito-screenshot.webp" alt="Featured Tech" title="Tech" description="Apps like Daito for buying, selling, and community." link="https://manyagi.net/tech" category="tech" />
        <Card image="/images/og-media.webp" alt="Featured Media" title="Media" description="Videos, podcasts, and narrations across our universe." link="https://manyagi.net/media" category="media" />
      </section>
      <section className="my-10">
        <h2 className="text-3xl font-bold mb-6 text-center">Cross-Promote Across Divisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="From Publishing to Designs" description="Read Legacy, then shop inspired merch." link="https://manyagi.net/designs" />
          <Card title="Media to Capital" description="Watch tutorials, subscribe to signals." link="https://manyagi.net/capital" />
          <Card title="Tech to All" description="Download Daito to buy books/merch." link="https://manyagi.net/tech" />
        </div>
      </section>
      <section id="subscribe" className="my-10">
        <Card>
          <SubscriptionForm formId="8427635" uid="db12290300" title="Get chapter 1 + drops + early access" description="Be the first to know about updates across all Manyagi divisions." />
        </Card>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto glass p-4 rounded">
        <h3 className="text-xl mb-4">Latest from @ManyagiOfficial</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/ManyagiOfficial?ref_src=twsrc%5Etfw" target="_blank" rel="noopener noreferrer">Tweets by ManyagiOfficial</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
      <Recommender />
    </>
  );
};