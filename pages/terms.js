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
      <div className="terms prose max-w-3xl mx-auto text-gray-800 py-10">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="mb-4">Effective Date: August 18, 2025</p>
        <p className="mb-4">Welcome to Manyagi. These Terms of Service ("Terms") govern your use of our website (manyagi.net), services, and products across all divisions: Publishing, Designs, Capital, Tech, and Media. By accessing or using our services, you agree to be bound by these Terms. If you do not agree, please do not use our services.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">You must be at least 18 years old to use our services. By using Manyagi, you represent that you meet this requirement and agree to comply with all applicable laws.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">2. User Accounts</h2>
        <p className="mb-4">Some features require an account. You agree to provide accurate information and keep it updated. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">3. Services and Products</h2>
        <p className="mb-4">Manyagi offers books, eBooks, audiobooks (Publishing); merchandise like T-shirts, mugs, posters (Designs); trading signals for Forex, Crypto (coming soon), Indices, Stocks (coming soon) via bots (Capital); apps like Daito for marketplaces (Tech); and media content like videos, podcasts (Media).</p>
        <p className="mb-4">Purchases are final for digital products. Physical goods follow our return policy (30 days for defects). Subscriptions (e.g., signals) auto-renew monthly; cancel anytime via account or support.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Payments</h2>
        <p className="mb-4">We use Stripe for payments. You agree to provide accurate billing information. All fees are non-refundable except as stated. For subscriptions, access (e.g., Telegram signals group) is granted post-payment and revoked upon cancellation or non-payment.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">5. Intellectual Property Rights</h2>
        <p className="mb-4">All content, including books, designs, signals, app code, and media, is owned by Manyagi or licensors. You may not reproduce, distribute, or create derivative works without permission. Limited license granted for personal use only.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">6. Disclaimers for Trading Signals</h2>
        <p className="mb-4">Signals in Capital are for informational/educational purposes only, not financial advice. Trading involves risk of loss; past performance does not guarantee future results. Manyagi is not liable for any losses. Consult a financial advisor. Crypto/Stock signals coming soon; current focus on Forex/Indices.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">7. Limitations of Liability</h2>
        <p className="mb-4">Manyagi provides services "as is" without warranties. We are not liable for indirect, consequential, or punitive damages. Liability limited to amount paid in last 12 months. For signals, no liability for trading outcomes.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">8. Indemnification</h2>
        <p className="mb-4">You agree to indemnify Manyagi against claims arising from your use, violation of Terms, or infringement of rights.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">9. Termination</h2>
        <p className="mb-4">We may terminate access for violations. Upon termination, licenses end; subscriptions cancel without refund.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">10. Governing Law</h2>
        <p className="mb-4">Terms governed by laws of Delaware, USA. Disputes resolved in Wilmington courts.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">11. Changes to Terms</h2>
        <p className="mb-4">We may update Terms; continued use constitutes acceptance. Check periodically.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">12. Contact Us</h2>
        <p className="mb-4">For questions: <a href="mailto:info@manyagi.net">info@manyagi.net</a>.</p>
        <p className="mt-8 text-sm">These Terms are adaptable for all divisions and similar to standards from Apple/Amazon.</p>
      </div>
    </>
  );
}