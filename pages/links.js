import Head from 'next/head';
import Link from 'next/link';

export default function Links() {
  return (
    <>
      <Head>
        <title>Manyagi Links</title>
        <meta name="description" content="Explore all Manyagi divisions in one place." />
        <meta property="og:title" content="Manyagi Links" />
        <meta property="og:description" content="Explore all Manyagi divisions in one place." />
        <meta property="og:image" content="https://manyagi.net/images/og-home.webp" />
        <meta property="og:url" content="https://manyagi.net/links" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <section className="container mx-auto px-4 py-10 text-center glass">
        <h1 className="text-4xl font-bold mb-6 kinetic">Manyagi Divisions</h1>
        <p className="mb-6">Discover our ecosystem of innovation, IP, and commerce.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Link href="/publishing" className="btn btn-publishing">Publishing</Link>
          <Link href="/designs" className="btn btn-designs">Designs</Link>
          <Link href="/capital" className="btn btn-capital">Capital</Link>
          <Link href="/media" className="btn btn-media">Media</Link>
          <Link href="/tech" className="btn btn-tech">Tech</Link>
          <Link href="/about" className="btn">About Us</Link>
        </div>
      </section>
    </>
  );
}