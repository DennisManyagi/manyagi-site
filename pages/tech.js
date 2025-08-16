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
        lead="Daito marketplace and delivery. Nexu to connect Africans globally. Nurse Connect for healthcare pros."
      >
        <Link href="#apps" className="btn">Explore Apps</Link>
      </Hero>
      <section id="apps" className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card>
          <h3 className="text-2xl mb-2">Daito</h3>
          <p className="text-muted text-sm mb-4">Buy & deliver anything. Launching in ~4 weeks. Join early access.</p>
          <SubscriptionForm formId="8432559" uid="701df306a9" title="Join Daito Early Access" description="Get beta invites and updates." />
          <p className="mt-4 text-muted text-sm">Sell <Link href="/designs" className="text-accent">merch</Link> on Daito.</p>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Nexu</h3>
          <p className="text-muted text-sm mb-4">Connect the African diaspora: community, commerce, and culture.</p>
          <SubscriptionForm formId="YOUR_NEXU_FORM_ID" uid="YOUR_NEXU_UID" title="Join Nexu Waitlist" description="Stay connected with updates." />
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Nurse Connect</h3>
          <p className="text-muted text-sm mb-4">Tools for nurses: jobs, community, education. Name TBD.</p>
          <SubscriptionForm formId="YOUR_NURSE_FORM_ID" uid="YOUR_NURSE_UID" title="Join Nurse Connect" description="Get launch notifications." />
        </Card>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">App Features Showcase</h3>
        <Image src="/images/daito-screenshot.jpg" alt="Daito Screenshot" width={600} height={400} className="rounded mb-4" />
        <p className="text-muted text-sm">Daito: Seamless buying and delivery interface.</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Beta Tester Testimonials</h3>
        <p className="text-muted mb-2">"Daito is a game-changer for logistics." - Beta User A</p>
        <p className="text-muted">"Nexu connects like no other." - Beta User B</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">FAQ</h3>
        <details className="mb-2">
          <summary className="cursor-pointer">When is launch?</summary>
          <p className="text-muted text-sm">Daito: Q3 2025.</p>
        </details>
        <details>
          <summary className="cursor-pointer">How to join beta?</summary>
          <p className="text-muted text-sm">Subscribe above.</p>
        </details>
      </section>
    </>
  );
}