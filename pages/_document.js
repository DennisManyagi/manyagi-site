// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manyagi.net';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Georgia&display=swap" rel="stylesheet" />
        {/* Global org JSON-LD */}
        <script
          type="application/ld+json"
          // Base Organization schema for the brand; pages can add more via <SEO jsonLd={...} />
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Manyagi',
              url: SITE_URL,
              description: 'Manyagi unites Publishing, Designs, Capital, Tech, Media, and Realty under one HQ.',
              logo: `${SITE_URL}/images/logo.png`,
              sameAs: [
                'https://instagram.com/manyagi.official',
                'https://tiktok.com/@manyagi.official',
                'https://youtube.com/@ManyagiOfficial',
                'https://x.com/ManyagiOfficial',
                'https://linkedin.com/company/manyagi',
                'https://pinterest.com/ManyagiOfficial',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'support@manyagi.net',
                contactType: 'customer support',
                availableLanguage: 'en',
              },
            }),
          }}
        />
        {/* We no longer hard-code robots/meta keywords here to avoid duplicating with SEO component */}
      </Head>
      <body className="bg-white text-black">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
