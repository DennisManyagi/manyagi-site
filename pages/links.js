import Head from 'next/head';
import Link from 'next/link';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaLinkedin, FaPinterest } from 'react-icons/fa';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';

export default function Links() {
  const socialLinks = [
    { platform: 'Instagram', handle: 'https://instagram.com/manyagi.official', icon: <FaInstagram size={24} /> },
    { platform: 'Twitter', handle: 'https://x.com/ManyagiOfficial', icon: <FaTwitter size={24} /> },
    { platform: 'YouTube', handle: 'https://youtube.com/@ManyagiOfficial', icon: <FaYoutube size={24} /> },
    { platform: 'LinkedIn', handle: 'https://linkedin.com/company/manyagi', icon: <FaLinkedin size={24} /> },
    { platform: 'Pinterest', handle: 'https://pinterest.com/ManyagiOfficial', icon: <FaPinterest size={24} /> },
    { platform: 'TikTok', handle: 'https://tiktok.com/@manyagi.official', icon: <FaTiktok size={24} /> },
  ];

  const divisionLinks = [
    { name: 'Publishing', url: '/publishing', description: 'Novels and poetry' },
    { name: 'Designs', url: '/designs', description: 'T-shirts, mugs, and prints' },
    { name: 'Capital', url: '/capital', description: 'Trading signals and bots' },
    { name: 'Tech', url: '/tech', description: 'Innovative apps' },
    { name: 'Media', url: '/media', description: 'Videos and audio' },
    { name: 'Realty', url: '/realty', description: 'Premium properties' },
  ];

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-home.webp',
  ];

  return (
    <>
      <Head>
        <title>Manyagi Links — Connect with Us</title>
        <meta name="description" content="Find all our social media and division links." />
      </Head>
      <Hero
        kicker="Links"
        title="Connect with Manyagi"
        lead="Explore our social media and divisions."
        carouselImages={carouselImages}
        height="h-[600px]"
      />

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Social Media</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.handle}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-4 border rounded hover:bg-gray-100"
            >
              {link.icon}
              <span>{link.platform}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Divisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {divisionLinks.map((link) => (
            <Link
              key={link.name}
              href={link.url}
              className="p-4 border rounded hover:bg-gray-100"
            >
              <h3 className="text-xl font-bold">{link.name}</h3>
              <p className="text-gray-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427853"
          uid="637df68a06"
          title="Stay Connected"
          description="Join our community for updates and insights."
        />
      </section>

      <Recommender />
    </>
  );
}