// next.config.js
const withTM = require('next-transpile-modules')(['gsap', 'tsparticles-engine']); // Add 'tsparticles-engine'
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
    domains: ['manyagi.net', 'images.unsplash.com', 'myfxbook.com', 'youtube.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
  experimental: {
    esmExternals: 'loose',
  },
});

module.exports = withMDX(nextConfig);