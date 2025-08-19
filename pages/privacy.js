// pages/privacy.js
import Head from 'next/head';
import Recommender from '../components/Recommender';

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
        <p className="mb-4">Manyagi is committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your information across our website and services. We adhere to industry standards to ensure data security and transparency. (Added: Generic privacy text from web search on 'standard privacy policy for conglomerate'; intention: Build trust, goal to comply with legal requirements and user expectations.)</p>
        {/* Additional standard sections: Data Collection, Use, Sharing, Security, Rights, Changes. */}
        <h2 className="text-2xl font-bold mt-6 mb-4 kinetic">Data Collection</h2>
        <p className="mb-4">We collect personal data like email for subscriptions, payment info for purchases, and usage data for analytics.</p>
        <h2 className="text-2xl font-bold mt-6 mb-4 kinetic">Use of Data</h2>
        <p className="mb-4">Data is used to provide services, improve user experience, and send updates.</p>
        <h2 className="text-2xl font-bold mt-6 mb-4 kinetic">Data Sharing</h2>
        <p className="mb-4">We share data with trusted partners like Stripe and Printful for processing.</p>
        <h2 className="text-2xl font-bold mt-6 mb-4 kinetic">Security</h2>
        <p className="mb-4">We use encryption and secure servers to protect your data.</p>
        <h2 className="text-2xl font-bold mt-6 mb-4 kinetic">Your Rights</h2>
        <p className="mb-4">You can access, update, or delete your data by contacting us.</p>
        <h2 className="text-2xl font-bold mt-6 mb-4 kinetic">Changes</h2>
        <p className="mb-4">We may update this policy; changes will be posted here.</p>
      </div>
      <Recommender />
    </>
  );
};