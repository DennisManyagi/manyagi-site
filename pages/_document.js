import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="robots" content="index,follow" />
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
                "https://instagram.com/manyagi",
                "https://tiktok.com/@manyagi",
                "https://youtube.com/@manyagi_media",
                "https://twitter.com/manyagi",
                "https://linkedin.com/company/manyagi",
                "https://pinterest.com/manyagi"
              ]
            }
          `}
        </script>
      </Head>
      <body className="bg-white text-black custom-cursor">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}