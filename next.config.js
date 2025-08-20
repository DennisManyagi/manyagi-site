// next.config.js
const withTM = require('next-transpile-modules')(['gsap', 'tsparticles-engine']);
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  images: {
    domains: [
      'manyagi.net',
      'images.unsplash.com',
      'myfxbook.com',
      'youtube.com',
      // Add additional domains if needed for external images
    ],
    // Optimize image loading
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, // Cache images for 60 seconds
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.hotjar.com https://cdn.mxpnl.com https://www.googletagmanager.com https://platform.twitter.com https://f.convertkit.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://manyagi.net https://images.unsplash.com https://myfxbook.com https://youtube.com; connect-src 'self' https://api.stripe.com https://api.printful.com https://api.telegram.org https://api.mixpanel.com https://api.formspree.io https://app.convertkit.com; frame-src 'self' https://www.youtube.com https://platform.twitter.com; font-src 'self' https://fonts.gstatic.com;" },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
  experimental: {
    esmExternals: 'loose', // Allows loose ESM handling for better compatibility
    optimizePackageImports: ['tsparticles-engine', 'gsap', 'framer-motion'], // Optimize imports for key libraries
  },
  // Enable compression for better performance
  compress: true,
  // Improve caching for static assets
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap.xml',
      },
    ];
  },
  // Optional: Add environment-specific configurations
  env: {
    SITE_URL: process.env.NEXTAUTH_URL || 'https://manyagi.net',
  },
});

module.exports = withMDX(nextConfig);