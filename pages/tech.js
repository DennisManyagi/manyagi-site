import Head from 'next/head';
import Hero from '../components/Hero';
import Card from '../components/Card';
import Image from 'next/image';

export default function Tech() {
  return (
    <>
      <Head>
        <title>Manyagi Tech — Apps</title>
        <meta name="description" content="Our Apps: Daito marketplace, Nexu/Nurse communities." />
        <meta property="og:title" content="Manyagi Tech" />
        <meta property="og:description" content="Our Apps: Daito marketplace, Nexu/Nurse communities." />
        <meta property="og:image" content="/images/og-tech.jpg" />
        <meta property="og:url" content="https://manyagi.net/tech" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Tech Solutions"
        title="Manyagi Tech"
        lead="Apps that connect and empower."
      />
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card>
          <h3 className="text-2xl mb-2 text-black">Daito</h3>
          <p className="text-gray-600 mb-4">Your go-to marketplace for buying, selling, and trading user-generated items.</p>
          <Image src="/images/daito-screenshot.jpg" alt="Daito Screenshot" width={600} height={400} className="rounded mb-4" />
        </Card>
        <Card>
          <h3 className="text-2xl mb-2 text-black">Nexu/Nurse</h3>
          <p className="text-gray-600 mb-4">Connect with communities and find opportunities.</p>
        </Card>
      </section>
    </>
  );
}