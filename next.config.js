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
      // 👇 Printful CDNs (needed for product mockup thumbnails)
      { protocol: 'https', hostname: 'files.cdn.printful.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.printful.com', pathname: '/**' },
      // keep for scripts if you ever use next/image with external script assets
      { protocol: 'https', hostname: 'js.stripe.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  async headers() {
    // NOTE: CSP must include Printful in img-src and connect-src for thumbnails to load.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://platform.twitter.com https://f.convertkit.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // 👉 allow Supabase, Printful, YouTube thumbs, Unsplash, and data/blob URLs
      "img-src 'self' data: blob: https://manyagi.net https://images.unsplash.com https://myfxbook.com https://youtube.com https://i.ytimg.com https://img.youtube.com https://syndication.twitter.com https://dlbbjeohndiwtofitwec.supabase.co https://files.cdn.printful.com https://img.printful.com",
      // media (mp4 from Supabase if you show reels)
      "media-src 'self' data: blob: https://dlbbjeohndiwtofitwec.supabase.co",
      "connect-src 'self' https://api.stripe.com https://api.telegram.org https://api.formspree.io https://app.convertkit.com https://www.google-analytics.com https://dlbbjeohndiwtofitwec.supabase.co wss://dlbbjeohndiwtofitwec.supabase.co https://files.cdn.printful.com https://img.printful.com",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://platform.twitter.com https://syndication.twitter.com https://js.stripe.com",
      "font-src 'self' https://fonts.gstatic.com",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
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
