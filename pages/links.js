import Head from 'next/head';
import Link from 'next/link';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaLinkedin, FaPinterest } from 'react-icons/fa';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';

export default function Links() {
  const socialLinks = [
    { platform: 'Instagram', handle: 'https://instagram.com/manyagiofficial', icon: <FaInstagram size={24} /> },
    { platform: 'Twitter', handle: 'https://x.com/ManyagiOfficial', icon: <FaTwitter size={24} /> },
    { platform: 'YouTube', handle: 'https://youtube.com/@ManyagiOfficial', icon: <FaYoutube size={24} /> },
    { platform: 'LinkedIn', handle: 'https://linkedin.com/company/manyagiofficial', icon: <FaLinkedin size={24} /> },
    { platform: 'Pinterest', handle: 'https://pinterest.com/ManyagiOfficial', icon: <FaPinterest size={24} /> },
    { platform: 'TikTok', handle: 'https://tiktok.com/@manyagiofficial', icon: <FaTiktok size={24} /> },
  ];

  const divisionLinks = [
    { name: 'Publishing', url: '/publishing', description: 'Novels, poetry, and IP ready for adaptation.' },
    { name: 'Designs', url: '/designs', description: 'Story-driven apparel, art prints, and merch.' },
    { name: 'Capital', url: '/capital', description: 'Long-term investing, frameworks, and capital labs.' },
    { name: 'Tech', url: '/tech', description: 'Web, apps, automation, and digital infrastructure.' },
    { name: 'Media', url: '/media', description: 'Content, documentaries, and distribution channels.' },
    { name: 'Realty', url: '/realty', description: 'Real estate and physical experiences (future-facing).' },
  ];

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-home.webp',
  ];

  return (
    <>
      <Head>
        <title>Manyagi Links — Connect with the Manyagi Ecosystem</title>
        <meta
          name="description"
          content="All official Manyagi links in one place — social channels, divisions, and ways to plug into the Manyagi ecosystem."
        />
      </Head>
      <Hero
        kicker="Links"
        title="Connect with the Manyagi Ecosystem"
        lead="Follow the journey, explore each division, and plug into the worlds we’re building."
        carouselImages={carouselImages}
        height="h-[600px]"
      />

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Social Media</h2>
        <p className="text-center text-sm text-gray-600 max-w-xl mx-auto mb-6">
          These are the official Manyagi channels for announcements, behind-the-scenes building, and new releases.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.handle}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-4 border rounded-lg hover:bg-gray-100 transition"
            >
              {link.icon}
              <span>{link.platform}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Divisions</h2>
        <p className="text-center text-sm text-gray-600 max-w-xl mx-auto mb-6">
          Explore each Manyagi division as its own doorway into the larger empire — different focus, same DNA.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {divisionLinks.map((link) => (
            <Link
              key={link.name}
              href={link.url}
              className="p-4 border rounded-lg hover:bg-gray-100 transition"
            >
              <h3 className="text-xl font-bold">{link.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427853"
          uid="637df68a06"
          title="Stay Connected"
          description="Join our list for new drops, launches, and ecosystem-wide updates from Manyagi."
        />
      </section>

      <Recommender />
    </>
  );
}
