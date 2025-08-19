// pages/terms.js
import Head from 'next/head';
import Recommender from '../components/Recommender';

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
        <p className="mb-4">By using Manyagi's services, you agree to these terms, which govern your use of our website, apps, and products. We provide a unified ecosystem for storytelling, commerce, and innovation, with a commitment to fairness and transparency. (Added: Generic terms text from web search on 'standard terms of service for conglomerate'; intention: Legal protection, goal to set clear expectations for users.)</p>
        {/* Additional standard sections: Use, Prohibited Activities, Intellectual Property, Limitation of Liability, Governing Law. */}
        <h2 className="text-2xl font-bold mt-6 mb-4 kinetic">Use of Services</h2>
        <p className="mb-4">You may use our services for personal or business purposes, subject to these terms.</p>
        <h2 className="text-2xl font-bold mt-6 mb-4 kinetic">Prohibited Activities</h2>
        <p className="mb-4">No illegal use, harassment, or infringement.</p>
        <h2 className="text-2xl font-bold mt-6 mb-4 kinetic">Intellectual Property</h2>
        <p className="mb-4">All content is owned by Manyagi; no unauthorized use.</p>
        <h2 className="text-2xl font-bold mt-6 mb-4 kinetic">Limitation of Liability</h2>
        <p className="mb-4">We are not liable for indirect damages.</p>
        <h2 className="text-2xl font-bold mt-6 mb-4 kinetic">Governing Law</h2>
        <p className="mb-4">Governed by laws of [Jurisdiction].</p>
      </div>
      <Recommender />
    </>
  );
};