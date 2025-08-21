// pages/links.js
import Head from 'next/head';
import Link from 'next/link';

export default function Links() {
  const links = [
    { href: 'https://instagram.com/manyagi.official', label: 'Instagram', category: 'social' },
    { href: 'https://x.com/ManyagiOfficial', label: 'X', category: 'social' },
    { href: 'https://youtube.com/@ManyagiOfficial', label: 'YouTube', category: 'social' },
    { href: 'https://pinterest.com/ManyagiOfficial', label: 'Pinterest', category: 'social' },
    { href: '/publishing', label: 'Publishing', category: 'internal' },
    { href: '/designs', label: 'Designs', category: 'internal' },
    { href: '/capital', label: 'Capital', category: 'internal' },
    { href: '/tech', label: 'Tech', category: 'internal' },
    { href: '/media', label: 'Media', category: 'internal' },
    { href: '/contact', label: 'Support', category: 'support' },
    { href: '/privacy', label: 'Privacy', category: 'support' },
    { href: '/terms', label: 'Terms', category: 'support' },
  ];

  return (
    <>
      <Head>
        <title>Manyagi — Links</title>
        <meta name="description" content="All our social and internal links in one place." />
      </Head>
      <section className="container mx-auto px-4 py-5">
        <h1 className="text-5xl font-bold text-center mb-6">Our Links</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-blue-600 hover:underline text-base p-2 rounded bg-gray-100 text-center"
              target={link.category === 'social' ? '_blank' : '_self'}
              rel={link.category === 'social' ? 'noopener noreferrer' : undefined}
              data-category={link.category}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};