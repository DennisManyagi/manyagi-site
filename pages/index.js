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
        <Link href="#subscribe" className="btn">Join the list</Link>
        <Link href="/publishing" className="btn ghost">Read Chapter 1</Link>
      </Hero>
      <section className="bento-grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card image="/images/legacy-chapter-1.webp" alt="Featured Publishing" title="Publishing" description="Two novels + poetry. Read the opening chapter and get updates." link="/publishing" category="publishing" />
        <Card image="/images/mock-tee-1.webp" alt="Featured Designs" title="Designs" description="Wear our stories with T-shirts, mugs, and posters." link="/designs" category="designs" />
        <Card image="/images/chart-hero.webp" alt="Featured Capital" title="Capital" description="Forex signals via bots. Crypto and stocks coming soon." link="/capital" category="capital" />
        <Card image="/images/daito-screenshot.webp" alt="Featured Tech" title="Tech" description="Apps like Daito for buying, selling, and community." link="/tech" category="tech" />
        <Card image="/images/og-media.webp" alt="Featured Media" title="Media" description="Videos, podcasts, and narrations across our universe." link="/media" category="media" />
      </section>
      <section id="subscribe" className="my-10">
        <Card>
          <SubscriptionForm formId="8427635" uid="db12290300" title="Get chapter 1 + drops + early access" description="Join the Manyagi Master List for news across all divisions." />
        </Card>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto glass p-4 rounded">
        <h3 className="text-xl mb-4 kinetic">Latest from @ManyagiOfficial</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/ManyagiOfficial?ref_src=twsrc%5Etfw">Tweets by ManyagiOfficial</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
      <Recommender />
    </>
  );
};