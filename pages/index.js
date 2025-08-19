import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <>
      <Head>
        <title>Manyagi — Innovation • IP • Commerce</title>
        <meta name="description" content="Manyagi unifies Publishing, Designs, Capital, Tech, and Media. Join for drops, chapters, signals, and app launches." />
        <meta property="og:title" content="Manyagi — Innovation • IP • Commerce" />
        <meta property="og:description" content="Manyagi unifies Publishing, Designs, Capital, Tech, and Media. Join for drops, chapters, signals, and app launches." />
        <meta property="og:image" content="https://manyagi.net/images/og-home.jpg" />
        <meta property="og:url" content="https://manyagi.net/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Manyagi Management"
        title="Build. Publish. Design. Trade. Launch."
        lead="One HQ powering books & poetry, fashion & art, trading signals, audio & film, and apps like Daito."
        carouselImages={['/images/home-carousel-1.jpg', '/images/home-carousel-2.jpg', '/images/home-carousel-3.jpg']}
      >
        <Link href="#subscribe" className="btn">Join the list</Link>
        <Link href="/publishing" className="btn ghost">Read Chapter 1</Link>
      </Hero>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card>
          <img src="/images/legacy-chapter-1.jpg" alt="Featured Publishing" className="w-full rounded mb-4" />
          <h3 className="text-2xl mb-2">Publishing</h3>
          <p className="text-muted mb-4">Two novels + poetry. Read the opening chapter and get updates.</p>
          <Link href="/publishing" className="btn">Explore Publishing</Link>
        </Card>
        <Card>
          <img src="/images/mock-tee-1.jpg" alt="Featured Designs" className="w-full rounded mb-4" />
          <h3 className="text-2xl mb-2">Designs</h3>
          <p className="text-muted mb-4">Wear our stories with T-shirts, mugs, and posters.</p>
          <Link href="/designs" className="btn">Shop Designs</Link>
        </Card>
        <Card>
          <img src="/images/chart-hero.jpg" alt="Featured Capital" className="w-full rounded mb-4" />
          <h3 className="text-2xl mb-2">Capital</h3>
          <p className="text-muted mb-4">Forex signals via bots. Crypto and stocks coming soon.</p>
          <Link href="/capital" className="btn">Join Capital</Link>
        </Card>
        <Card>
          <img src="/images/daito-screenshot.jpg" alt="Featured Tech" className="w-full rounded mb-4" />
          <h3 className="text-2xl mb-2">Tech</h3>
          <p className="text-muted mb-4">Apps like Daito for buying, selling, and community.</p>
          <Link href="/tech" className="btn">Download Apps</Link>
        </Card>
        <Card>
          <img src="/images/og-media.jpg" alt="Featured Media" className="w-full rounded mb-4" />
          <h3 className="text-2xl mb-2">Media</h3>
          <p className="text-muted mb-4">Videos, podcasts, and narrations across our universe.</p>
          <Link href="/media" className="btn">Watch Now</Link>
        </Card>
      </section>
      <section id="subscribe" className="my-10">
        <Card>
          <SubscriptionForm formId="8427635" uid="db12290300" title="Get chapter 1 + drops + early access" description="Join the Manyagi Master List for news across all divisions." />
        </Card>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto">
        <h3 className="text-xl mb-4">Latest from @manyagi</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/manyagi?ref_src=twsrc%5Etfw">Tweets by manyagi</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
    </>
  );
}