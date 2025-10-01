// components/SEO.js
import Head from 'next/head';

export default function SEO({ title, description, keywords, url, image }) {
  const siteName = 'Manyagi';
  const defaultDescription = 'Manyagi - Empowering publishing, designs, capital, tech, media, and realty.';
  const defaultImage = '/default-og-image.jpg'; // Add this image to /public

  return (
    <Head>
      <title>{title || siteName}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || 'publishing, designs, capital, tech, media, realty, manyagi'} />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={title || siteName} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={url || 'https://your-site.com'} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteName} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            url: url || 'https://your-site.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://your-site.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </Head>
  );
}