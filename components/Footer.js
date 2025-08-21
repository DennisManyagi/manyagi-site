// components/Footer.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaLinkedin, FaPinterest } from 'react-icons/fa';
import { useState } from 'react';

const Footer = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState({ instagram: false, tiktok: false, youtube: false, twitter: false, linkedin: false, pinterest: false });

  const socialLinks = {
    parent: [
      { platform: 'instagram', handle: 'https://instagram.com/manyagi.official', label: 'Manyagi (Parent)' },
      { platform: 'twitter', handle: 'https://x.com/ManyagiOfficial', label: 'Manyagi (Parent)' },
      { platform: 'youtube', handle: 'https://youtube.com/@ManyagiOfficial', label: 'Manyagi (Parent)' },
      { platform: 'pinterest', handle: 'https://pinterest.com/ManyagiOfficial', label: 'Manyagi (Parent)' },
    ],
    publishing: [
      { platform: 'instagram', handle: 'https://instagram.com/manyagi_publishing', label: 'Publishing' },
      { platform: 'twitter', handle: 'https://x.com/ManyagiPublishing', label: 'Publishing' },
      { platform: 'pinterest', handle: 'https://pinterest.com/ManyagiPublishing', label: 'Publishing' },
    ],
    designs: [
      { platform: 'instagram', handle: 'https://instagram.com/manyagi_designs', label: 'Designs' },
      { platform: 'twitter', handle: 'https://x.com/manyagi_designs', label: 'Designs' },
      { platform: 'tiktok', handle: 'https://tiktok.com/@manyagi_designs', label: 'Designs' },
      { platform: 'pinterest', handle: 'https://pinterest.com/ManyagiDesigns', label: 'Designs' },
    ],
    capital: [
      { platform: 'linkedin', handle: 'https://linkedin.com/company/manyagi-capital', label: 'Capital' },
      { platform: 'twitter', handle: 'https://x.com/ManyagiCapital', label: 'Capital' },
      { platform: 'youtube', handle: 'https://youtube.com/@ManyagiCapital', label: 'Capital' },
    ],
    tech: [
      { platform: 'linkedin', handle: 'https://linkedin.com/company/manyagi-tech', label: 'Tech' },
      { platform: 'twitter', handle: 'https://x.com/ManyagiTech', label: 'Tech' },
      { platform: 'instagram', handle: 'https://instagram.com/manyagi_tech', label: 'Tech' },
      { platform: 'youtube', handle: 'https://youtube.com/@ManyagiTech', label: 'Tech' },
    ],
    media: [
      { platform: 'youtube', handle: 'https://youtube.com/@ManyagiMedia', label: 'Media' },
      { platform: 'instagram', handle: 'https://instagram.com/manyagi_media', label: 'Media' },
      { platform: 'tiktok', handle: 'https://tiktok.com/@manyagi_media', label: 'Media' },
      { platform: 'twitter', handle: 'https://x.com/ManyagiMedia', label: 'Media' },
    ],
  };

  const getDivision = () => {
    const path = router.pathname;
    if (path.includes('publishing')) return 'publishing';
    if (path.includes('designs')) return 'designs';
    if (path.includes('capital')) return 'capital';
    if (path.includes('tech')) return 'tech';
    if (path.includes('media')) return 'media';
    return 'parent';
  };

  const division = getDivision();
  const currentLinks = socialLinks[division];

  const toggleDropdown = (platform) => {
    setIsOpen(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <footer className="bg-white text-black py-5 border-t border-gray-300">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between gap-4 items-center text-center md:text-left">
        <div>© 2025 Manyagi. All rights reserved.</div>
        <div className="flex gap-4 text-sm">
          <Link href="/privacy" className="hover:text-yellow-500">Privacy</Link>
          <Link href="/terms" className="hover:text-yellow-500">Terms</Link>
          <Link href="/about" className="hover:text-yellow-500">About</Link>
        </div>
        <div className="flex gap-4 text-lg relative">
          {currentLinks.map((link) => (
            <div key={link.platform}>
              <button onClick={() => toggleDropdown(link.platform)} aria-label={link.platform}>
                {link.platform === 'instagram' && <FaInstagram className="hover:text-yellow-500 transition" />}
                {link.platform === 'tiktok' && <FaTiktok className="hover:text-yellow-500 transition" />}
                {link.platform === 'youtube' && <FaYoutube className="hover:text-yellow-500 transition" />}
                {link.platform === 'twitter' && <FaTwitter className="hover:text-yellow-500 transition" />}
                {link.platform === 'linkedin' && <FaLinkedin className="hover:text-yellow-500 transition" />}
                {link.platform === 'pinterest' && <FaPinterest className="hover:text-yellow-500 transition" />}
              </button>
              {isOpen[link.platform] && (
                <div className="absolute bottom-full mb-2 bg-white text-black p-2 rounded shadow-lg left-0">
                  <a href={link.handle} target="_blank" rel="noopener noreferrer">{link.label}</a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;