import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Georgia&display=swap" rel="stylesheet" />
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
              "description": "Manyagi unites Publishing, Designs, Capital, Tech, Media, and Realty under one HQ.",
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
                "email": "support@manyagi.net",
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