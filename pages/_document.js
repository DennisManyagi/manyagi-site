// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Georgia&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="robots" content="index,follow" />
        <meta name="keywords" content="Manyagi, publishing, designs, capital, tech, media, books, merchandise, trading signals, apps, videos" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="sitemap" href="/sitemap.xml" type="application/xml" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Manyagi",
              "url": "https://manyagi.net",
              "logo": "https://manyagi.net/images/logo.png",
              "description": "Multibillion-dollar conglomerate spanning Publishing, Designs, Capital, Tech, and Media.",
              "sameAs": [
                "https://instagram.com/manyagi.official",
                "https://tiktok.com/@manyagi.official",
                "https://youtube.com/@ManyagiOfficial",
                "https://twitter.com/ManyagiOfficial",
                "https://linkedin.com/company/manyagi",
                "https://pinterest.com/ManyagiOfficial"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "support@manyagi.com",
                "telephone": "+1-555-123-4567"
              }
            }
          `}
        </script>
      </Head>
      <body className="bg-white text-black">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}