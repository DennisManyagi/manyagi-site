// next.config.js
const withTM = require('next-transpile-modules')(['gsap']);
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: { remarkPlugins: [], rehypePlugins: [] },
});

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'manyagi.net', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'myfxbook.com', pathname: '/**' },
      { protocol: 'https', hostname: 'youtube.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
      { protocol: 'https', hostname: 'dlbbjeohndiwtofitwec.supabase.co', pathname: '/**' },
      // Printful CDNs (mockups)
      { protocol: 'https', hostname: 'files.cdn.printful.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.printful.com', pathname: '/**' },
      // keep for scripts if you ever use next/image with external script assets
      { protocol: 'https', hostname: 'js.stripe.com', pathname: '/**' },
      // maps tiles / static maps (optional future)
      { protocol: 'https', hostname: 'maps.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: 'maps.gstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.gstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.google.com', pathname: '/**' },
      { protocol: 'https', hostname: 'maps.google.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  async headers() {
    // CSP tuned for:
    // - Stripe checkout
    // - Google Maps iframe + tiles
    // - Google Tag Manager
    // - Supabase storage + realtime
    // - Printful mockup images
    // - Twitter embeds / YouTube iframes
    //
    // NOTE: 'unsafe-eval' + 'unsafe-inline' are currently allowed because:
    // - Next dev / HMR
    // - Inline GTM snippet
    // We can tighten later with nonces/hashes.
    const csp = [
      // default fallback
      "default-src 'self'",
      // scripts we allow to run
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: https://www.googletagmanager.com https://www.google-analytics.com https://platform.twitter.com https://f.convertkit.com https://js.stripe.com https://maps.googleapis.com https://www.gstatic.com https://www.google.com",
      // inline styles + Google Fonts CSS
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // images (product thumbs, user uploads, YT thumbs, map tiles, etc)
      [
        "img-src 'self' data: blob:",
        "https://manyagi.net",
        "https://images.unsplash.com",
        "https://myfxbook.com",
        "https://youtube.com",
        "https://i.ytimg.com",
        "https://img.youtube.com",
        "https://syndication.twitter.com",
        "https://dlbbjeohndiwtofitwec.supabase.co",
        "https://files.cdn.printful.com",
        "https://img.printful.com",
        "https://maps.googleapis.com",
        "https://maps.gstatic.com",
        "https://www.gstatic.com",
        "https://www.google.com",
        "https://maps.google.com",
        "https://*.ggpht.com",
        "https://*.googleusercontent.com",
      ].join(' '),
      // audio/video blobs from Supabase, etc.
      "media-src 'self' data: blob: https://dlbbjeohndiwtofitwec.supabase.co",
      // XHR / fetch / websockets
      [
        "connect-src 'self'",
        "https://api.stripe.com",
        "https://api.telegram.org",
        "https://api.formspree.io",
        "https://app.convertkit.com",
        "https://www.google-analytics.com",
        "https://dlbbjeohndiwtofitwec.supabase.co",
        "wss://dlbbjeohndiwtofitwec.supabase.co",
        "https://files.cdn.printful.com",
        "https://img.printful.com",
        "https://maps.googleapis.com",
        "https://www.gstatic.com",
        "https://www.google.com",
        "https://maps.google.com",
      ].join(' '),
      // iframes we embed
      [
        "frame-src 'self'",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com",
        "https://platform.twitter.com",
        "https://syndication.twitter.com",
        "https://js.stripe.com",
        "https://hooks.stripe.com",
        "https://maps.google.com",
        "https://www.google.com",
      ].join(' '),
      // fonts
      "font-src 'self' data: https://fonts.gstatic.com",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },

  experimental: {
    esmExternals: 'loose',
    optimizePackageImports: ['gsap', 'framer-motion'],
  },

  compress: true,

  async rewrites() {
    return [{ source: '/sitemap.xml', destination: '/sitemap.xml' }];
  },

  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXTAUTH_URL || 'https://manyagi.net',
    SITE_URL: process.env.NEXTAUTH_URL || 'https://manyagi.net',
  },
});

module.exports = withMDX(nextConfig);
