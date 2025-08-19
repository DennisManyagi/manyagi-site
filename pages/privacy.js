import Head from 'next/head';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Manyagi Privacy Policy</title>
        <meta name="description" content="How Manyagi collects, uses, and protects your data." />
        <meta property="og:title" content="Manyagi Privacy Policy" />
        <meta property="og:description" content="How Manyagi collects, uses, and protects your data." />
        <meta property="og:image" content="https://manyagi.net/images/og-home.jpg" />
        <meta property="og:url" content="https://manyagi.net/privacy" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="privacy prose max-w-3xl mx-auto text-gray-800 py-10 glass p-4 rounded">
        <h1 className="text-4xl font-bold mb-6 kinetic">Privacy Policy</h1>
        <p className="mb-4">Effective Date: August 18, 2025</p>
        {/* ... rest unchanged ... */}
      </div>
      <Recommender />
    </>
  );
}