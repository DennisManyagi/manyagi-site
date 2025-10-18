// components/SEO.js
import Head from 'next/head';
import { useRouter } from 'next/router';

const SITE_NAME = 'Manyagi';
const TAGLINE = 'Creativity Meets Innovation';
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://manyagi.net';

// Put a real image into /public/og-default.jpg (1200x630 recommended)
const DEFAULT_IMAGE = '/og-default.jpg';
const DEFAULT_DESC =
  'Manyagi — Creativity Meets Innovation across Publishing, Designs, Media, Capital, Tech, and Realty.';

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',         // article | product | video.other, etc.
  noindex = false,
  publishedTime,             // ISO string for articles
  modifiedTime,              // ISO string for articles
  jsonLd = null,             // optional extra JSON-LD object per page
}) {
  const router = useRouter();
  const path = (router && router.asPath) || '/';
  const canonical = (url || `${BASE_URL}${path.split('?')[0]}`).replace(/\/+$/, '') || BASE_URL;

  const pageTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — ${TAGLINE}`;
  const desc = description || DEFAULT_DESC;
  const ogImage = image?.startsWith('http')
    ? image
    : `${BASE_URL}${(image || DEFAULT_IMAGE).startsWith('/') ? '' : '/'}${image || DEFAULT_IMAGE}`;

  const robots = noindex ? 'noindex,nofollow' : 'index,follow';

  const articleMeta = type === 'article'
    ? [
        publishedTime ? <meta key="article:published_time" property="article:published_time" content={publishedTime} /> : null,
        modifiedTime ? <meta key="article:modified_time" property="article:modified_time" content={modifiedTime} /> : null,
      ].filter(Boolean)
    : null;

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    description: DEFAULT_DESC,
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Head>
      {/* Title + Canonical */}
      <title>{pageTitle}</title>
      <link rel="canonical" href={canonical} />

      {/* Basic */}
      <meta name="description" content={desc} />
      <meta name="robots" content={robots} />
      <meta name="theme-color" content="#000000" />

      {/* OpenGraph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {articleMeta}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        // Website baseline
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {jsonLd ? (
        <script
          key="page-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </Head>
  );
}
