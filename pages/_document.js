// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manyagi.net';

export default function Document() {
  // Detect build environment at render time on server
  const isProd = process.env.NODE_ENV === 'production';

  // In dev: go loose so Next.js HMR, inline scripts, eval, etc. work
  const devCsp = `
    default-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:* blob: data:;
    img-src 'self' blob: data: https:;
    font-src 'self' data: https://fonts.gstatic.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://js.stripe.com https://maps.googleapis.com https://www.gstatic.com https://www.google.com;
    connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:* https: http: wss: blob:;
    frame-src 'self' https://js.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com https://www.google.com;
    media-src 'self' blob: data: https:;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://js.stripe.com;
  `;

  // In prod: tighter, but still allow Stripe checkout + Google Maps iframe + YouTube embeds
  const prodCsp = `
    default-src 'self';
    img-src 'self' data: blob: https:;
    font-src 'self' data: https://fonts.gstatic.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    script-src
      'self'
      'unsafe-inline'
      'unsafe-eval'
      blob:
      https://js.stripe.com
      https://www.gstatic.com
      https://maps.googleapis.com
      https://www.google.com;
    connect-src
      'self'
      https:
      wss:;
    frame-src
      'self'
      https://www.youtube.com
      https://www.youtube-nocookie.com
      https://js.stripe.com
      https://maps.google.com
      https://www.google.com;
    media-src 'self' blob: data: https:;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://js.stripe.com;
  `;

  const cspToUse = isProd ? prodCsp : devCsp;

  return (
    <Html lang="en">
      <Head>
        {/* Content Security Policy */}
        <meta httpEquiv="Content-Security-Policy" content={cspToUse} />

        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Georgia&display=swap"
          rel="stylesheet"
        />

        {/* Global org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Manyagi',
              url: SITE_URL,
              description:
                'Manyagi unites Publishing, Designs, Capital, Tech, Media, and Realty under one HQ.',
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
      </Head>
      <body className="bg-white text-black">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
