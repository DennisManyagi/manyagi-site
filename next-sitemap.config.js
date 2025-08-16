/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://manyagi.net',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/server-sitemap.xml'], // If adding dynamic later
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};