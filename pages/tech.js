import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm'; // Added import

export default function Tech() {
  return (
    <>
      <Head>
        <title>Manyagi Tech — Apps for Commerce</title>
        <meta name="description" content="Download Daito for buying/selling, Nexu for jobs, Nurse for healthcare community." />
        <meta property="og:title" content="Manyagi Tech — Apps for Commerce" />
        <meta property="og:description" content="Download Daito for buying/selling, Nexu for jobs, Nurse for healthcare community." />
        <meta property="og:image" content="https://manyagi.net/images/og-tech.jpg" />
        <meta property="og:url" content="https://manyagi.net/tech" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Apps & Platforms"
        title="Manyagi Tech"
        lead="Empowering commerce and community with apps like Daito, Nexu, and Nurse."
        carouselImages={['/images/app-carousel-1.jpg', '/images/app-carousel-2.jpg', '/images/app-carousel-3.jpg']}
      >
        <Link href="https://apps.apple.com/[DAITO_APP_ID]" className="btn">Download Daito</Link>
      </Hero>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card>
          <img src="/images/daito-screenshot.jpg" alt="Daito App" className="w-full rounded mb-4" />
          <h3 className="text-2xl mb-2">Daito Marketplace</h3>
          <p className="text-muted mb-4">Buy and sell merch, books, and more. 5-10% fees.</p>
          <Link href="https://apps.apple.com/[DAITO_APP_ID]" className="btn">Download on App Store</Link>
          <Link href="https://play.google.com/store/apps/details?id=[DAITO_PACKAGE]" className="btn mt-2">Download on Google Play</Link>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Nexu Jobs</h3>
          <p className="text-muted mb-4">Diaspora job platform, coming soon.</p>
          <Link href="#join" className="btn">Join Waitlist</Link>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Nurse Community</h3>
          <p className="text-muted mb-4">Healthcare networking, coming soon.</p>
          <Link href="#join" className="btn">Join Waitlist</Link>
        </Card>
      </section>
      <section className="division-desc prose max-w-3xl mx-auto text-gray-800">
        <h2 className="text-3xl font-bold mb-6">Manyagi Tech: Tools for Empowerment</h2>
        <h3 className="text-2xl font-bold mt-6 mb-4">Overview</h3>
        <p className="mb-4">Like Etsy/LinkedIn, apps for marketplaces (Daito), community/jobs (Nexu/Nurse).</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Products/Services</h3>
        <p className="mb-4">Daito: User-to-user sales (5-10% fees). Nexu: Diaspora jobs. Nurse: Healthcare community. Downloads via App Store/Google Play.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Why Choose Us</h3>
        <p className="mb-4">Seamless, secure. Cross-promote: Sell merch/books on Daito, find jobs inspired by stories.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Testimonials</h3>
        <p className="mb-4">"Easy marketplace!" - User A. "Great community!" - User B.</p>
        <p className="mt-6"><Link href="https://apps.apple.com/[DAITO_APP_ID]" className="btn">Download Daito</Link></p>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto">
        <h3 className="text-xl mb-4">Latest from @manyagi_tech</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/manyagi_tech?ref_src=twsrc%5Etfw">Tweets by manyagi_tech</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
      <section id="join" className="my-10">
        <Card>
          <SubscriptionForm formId="8427635" uid="db12290300" title="Join Tech Waitlist" description="Get updates on Nexu and Nurse launches." />
        </Card>
      </section>
    </>
  );
}