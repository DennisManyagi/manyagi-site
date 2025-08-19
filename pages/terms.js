import Head from 'next/head';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Manyagi Terms of Service</title>
        <meta name="description" content="Terms of Service for Manyagi's services across all divisions." />
        <meta property="og:title" content="Manyagi Terms of Service" />
        <meta property="og:description" content="Terms of Service for Manyagi's services across all divisions." />
        <meta property="og:image" content="https://manyagi.net/images/og-home.jpg" />
        <meta property="og:url" content="https://manyagi.net/terms" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="terms prose max-w-3xl mx-auto text-gray-800 py-10 glass p-4 rounded">
        <h1 className="text-4xl font-bold mb-6 kinetic">Terms of Service</h1>
        <p className="mb-4">Effective Date: August 18, 2025</p>
        {/* ... rest unchanged ... */}
      </div>
      <Recommender />
    </>
  );
}