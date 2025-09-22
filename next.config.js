const withTM = require('next-transpile-modules')(['gsap', '@tsparticles/engine']);
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'manyagi.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'myfxbook.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dlbbjeohndiwtofitwec.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.hotjar.com https://script.hotjar.com https://www.googletagmanager.com https://platform.twitter.com https://f.convertkit.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://manyagi.net https://images.unsplash.com https://myfxbook.com https://youtube.com https://syndication.twitter.com https://dlbbjeohndiwtofitwec.supabase.co; connect-src 'self' https://api.stripe.com https://api.printful.com https://api.telegram.org https://api.formspree.io https://app.convertkit.com https://www.google-analytics.com; frame-src 'self' https://www.youtube.com https://platform.twitter.com https://syndication.twitter.com; font-src 'self' https://fonts.gstatic.com;",
          },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
  experimental: {
    esmExternals: 'loose',
    optimizePackageImports: ['@tsparticles/engine', 'gsap', 'framer-motion'],
  },
  compress: true,
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap.xml',
      },
    ];
  },
  env: {
    SITE_URL: process.env.NEXTAUTH_URL || 'https://manyagi.net',
  },
});


// next.config.js (from previous, with printful.com)
const withTM = require('next-transpile-modules')(['gsap', '@tsparticles/engine']);
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
      'printful.com',  // Added for POD thumbnails
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.hotjar.com https://script.hotjar.com https://cdn.mxpnl.com https://www.googletagmanager.com https://platform.twitter.com https://f.convertkit.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://manyagi.net https://images.unsplash.com https://myfxbook.com https://youtube.com https://syndication.twitter.com https://printful.com; connect-src 'self' https://api.stripe.com https://api.printful.com https://api.telegram.org https://api.mixpanel.com https://api-js.mixpanel.com https://api.formspree.io https://app.convertkit.com https://www.google-analytics.com https://dlbbjeohndiwtofitwec.supabase.co; frame-src 'self' https://www.youtube.com https://platform.twitter.com https://syndication.twitter.com; font-src 'self' https://fonts.gstatic.com;",
          },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
  experimental: {
    esmExternals: 'loose',
    optimizePackageImports: ['@tsparticles/engine', 'gsap', 'framer-motion'],
  },
  compress: true,
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap.xml',
      },
    ];
  },
  env: {
    SITE_URL: process.env.NEXTAUTH_URL || 'https://manyagi.net',
  },
});

module.exports = withMDX(nextConfig);