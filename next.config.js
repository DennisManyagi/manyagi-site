// next.config.js (full updated version)
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  images: {
    domains: ['manyagi.net', 'images.unsplash.com', 'myfxbook.com', 'youtube.com'], // Added for embeds/images
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
  output: 'export', // Add this line for static export (replaces next export)
};

module.exports = withMDX(nextConfig);