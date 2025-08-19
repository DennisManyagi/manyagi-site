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
      <div className="privacy prose max-w-3xl mx-auto text-gray-800 py-10">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4">Effective Date: August 18, 2025</p>
        <p className="mb-4">Manyagi respects your privacy. This Policy explains how we collect, use, share, and protect data across our website and services (Publishing, Designs, Capital, Tech, Media).</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Data Collection</h2>
        <p className="mb-4">We collect: Personal info (name, email via ConvertKit forms, payment details via Stripe); Usage data (IP, browser via Google Analytics); App data (user interactions via Firebase); Signals access (Telegram ID for subscriptions).</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Data</h2>
        <p className="mb-4">To provide services (deliver eBooks, signals, app access); Process payments/subscriptions; Send updates/marketing (ConvertKit emails); Analyze/improve (Analytics); Comply with laws.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Sharing</h2>
        <p className="mb-4">With processors (Stripe for payments, ConvertKit for emails, Firebase for apps, Telegram for signals). No selling. May share for legal reasons or mergers.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Security</h2>
        <p className="mb-4">We use encryption (HTTPS), access controls, regular audits. However, no system is fully secure; report issues to <a href="mailto:info@manyagi.net">info@manyagi.net</a>.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">5. Your Rights (GDPR/CCPA Compliance)</h2>
        <p className="mb-4">Access, correct, delete data; Opt-out marketing; Cookie consent. EU/US residents: Contact for requests. We comply with GDPR/CCPA; data retention as needed (e.g., subscriptions active).</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">6. Cookies and Tracking</h2>
        <p className="mb-4">Use cookies for analytics/preferences. Manage via browser. Third-party (Google Analytics) may track; opt-out via their tools.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">7. Children's Privacy</h2>
        <p className="mb-4">Not for under 13; no knowing collection from children.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes</h2>
        <p className="mb-4">Updates posted; continued use accepts.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact</h2>
        <p className="mb-4">For questions/requests: <a href="mailto:info@manyagi.net">info@manyagi.net</a>.</p>
        <p className="mt-8 text-sm">Similar to Google/Facebook policies, focused on emails/payments/app usage.</p>
      </div>
    </>
  );
}