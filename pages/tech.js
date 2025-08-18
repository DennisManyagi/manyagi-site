import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import Image from 'next/image';

export default function Tech() {
  return (
    <>
      <Head>
        <title>Manyagi Tech — Daito, Nexu, Nurse Connect</title>
        <meta name="description" content="Hub for Manyagi apps. Daito marketplace + delivery, Nexu for the African diaspora, and Nurse Connect." />
        <meta property="og:title" content="Manyagi Tech — Daito, Nexu, Nurse Connect" />
        <meta property="og:description" content="Hub for Manyagi apps. Daito marketplace + delivery, Nexu for the African diaspora, and Nurse Connect." />
        <meta property="og:image" content="https://manyagi.net/images/og-tech.jpg" />
        <meta property="og:url" content="https://manyagi.net/tech" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Apps & Platforms"
        title="Manyagi Tech"
        lead="Hub for apps like Daito (e-commerce/marketplace), Nexu/Nurse (community/jobs). Screenshots, downloads."
      >
        <Link href="#apps" className="btn">Explore Apps</Link>
      </Hero>
      <section id="apps" className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card>
          <h3 className="text-2xl mb-2">Daito</h3>
          <p className="text-muted text-sm mb-4">Marketplace for user-to-user sales, 10% off early users.</p>
          <Image src="/images/daito-screenshot.jpg" alt="Daito Screenshot" width={300} height={200} className="rounded mb-4" />
          <Link href="https://appstore.link" className="btn">Download iOS</Link>
          <Link href="https://playstore.link" className="btn ghost mt-2">Download Android</Link>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Nexu</h3>
          <p className="text-muted text-sm mb-4">Community and jobs for diaspora.</p>
          <SubscriptionForm formId="8432559" uid="701df306a9" title="Join Nexu Waitlist" description="Stay connected with updates." />
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Nurse Connect</h3>
          <p className="text-muted text-sm mb-4">Jobs and community for nurses.</p>
          <SubscriptionForm formId="8432560" uid="701df306b0" title="Join Nurse Connect" description="Get launch notifications." />
        </Card>
      </section>
    </>
  );
}