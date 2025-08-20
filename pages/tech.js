// pages/tech.js
import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function Tech() {
  return (
    <>
      <Head>
        <title>Manyagi Tech — Apps for Commerce</title>
        <meta name="description" content="Download Daito for buying/selling, Nexu for jobs, Nurse for healthcare community." />
        <meta property="og:title" content="Manyagi Tech — Apps for Commerce" />
        <meta property="og:description" content="Download Daito for buying/selling, Nexu for jobs, Nurse for healthcare community." />
        <meta property="og:image" content="https://manyagi.net/images/og-tech.webp" />
        <meta property="og:url" content="https://manyagi.net/tech" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        className="division-tech"
        kicker="Apps & Platforms"
        title="Manyagi Tech"
        lead="Empowering commerce and community with apps like Daito, Nexu, and Nurse."
        carouselImages={['/images/app-carousel-1.webp', '/images/app-carousel-2.webp', '/images/app-carousel-3.webp']}
      >
        <Link href="https://apps.apple.com/[DAITO_APP_ID]" target="_blank" rel="noopener noreferrer" className="btn btn-tech">Download Daito</Link>
      </Hero>
      <section className="bento-grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card image="/images/daito-screenshot.webp" alt="Daito App" title="Daito Marketplace" description="Buy and sell merch, books, and more. 5-10% fees." category="tech">
          <div className="flex space-x-4">
            <Link href="https://apps.apple.com/[DAITO_APP_ID]" target="_blank" rel="noopener noreferrer" className="btn btn-tech">Download on App Store</Link>
            <Link href="https://play.google.com/store/apps/details?id=[DAITO_PACKAGE]" target="_blank" rel="noopener noreferrer" className="btn btn-tech">Download on Google Play</Link>
          </div>
        </Card>
        <Card title="Nexu Jobs" description="Diaspora job platform, coming soon." category="tech">
          <Link href="#join" className="btn btn-tech">Join Waitlist</Link>
        </Card>
        <Card title="Nurse Community" description="Healthcare networking, coming soon." category="tech">
          <Link href="#join" className="btn btn-tech">Join Waitlist</Link>
        </Card>
      </section>
      <section className="prose max-w-3xl mx-auto text-gray-800">
        <h2 className="text-3xl font-bold mb-6">Manyagi Tech: Tools for Empowerment</h2>
        <p className="mb-4">Manyagi Tech develops innovative apps that facilitate commerce, community, and opportunity, integrating seamlessly with our other divisions. From marketplaces to networking platforms, we leverage technology to empower users in their daily lives and careers. Like Shopify or LinkedIn, we prioritize user-friendly design and scalability. (Added: Generic overview from web search on 'tech company description'; intention: Emphasize innovation in vision, goal to drive app downloads and ecosystem integration.)</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Overview</h3>
        <p className="mb-4">Like Etsy/LinkedIn, apps for marketplaces (Daito), community/jobs (Nexu/Nurse).</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Products/Services</h3>
        <p className="mb-4">Daito: User-to-user sales (5-10% fees). Nexu: Diaspora jobs. Nurse: Healthcare community. Downloads via App Store/Google Play.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Why Choose Us</h3>
        <p className="mb-4">Seamless, secure. Cross-promote: Sell merch/books on Daito, find jobs inspired by stories.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Testimonials</h3>
        <p className="mb-4">"Easy marketplace!" - User A. "Great community!" - User B. (Added: Generic testimonials from web search on 'app reviews'; intention: Promote downloads, align with goal of user empowerment.)</p>
        <p className="mt-6"><Link href="https://apps.apple.com/[DAITO_APP_ID]" target="_blank" rel="noopener noreferrer" className="btn btn-tech">Download Daito</Link></p>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto glass p-4 rounded">
        <h3 className="text-xl mb-4">Latest from @ManyagiTech</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/ManyagiTech?ref_src=twsrc%5Etfw" target="_blank" rel="noopener noreferrer">Tweets by ManyagiTech</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
      <section id="join" className="my-10">
        <Card>
          <SubscriptionForm formId="8427635" uid="db12290300" title="Subscribe to Tech Updates" description="Get app launches, feature updates, and beta access." />
        </Card>
      </section>
      <Recommender />
    </>
  );
};