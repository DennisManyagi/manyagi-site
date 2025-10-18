/** @type {import('next-sitemap').IConfig} */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manyagi.net';

module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/server-sitemap.xml'], // keep if you later attach a server sitemap
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
    additionalSitemaps: [
      `${SITE_URL}/sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    // Set higher priority for home + divisions
    const hi = ['/', '/publishing', '/designs', '/media', '/capital', '/tech', '/realty', '/blog'];
    return {
      loc: path,
      changefreq: 'daily',
      priority: hi.includes(path) ? 0.9 : 0.7,
      lastmod: new Date().toISOString(),
    };
  },
};
