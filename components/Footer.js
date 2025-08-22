// components/Footer.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaLinkedin, FaPinterest } from 'react-icons/fa';
import { useEffect } from 'react';

const Footer = () => {
  const router = useRouter();

  const socialLinks = {
    parent: [
      { platform: 'instagram', handle: 'https://instagram.com/manyagi.official', label: 'Instagram' },
      { platform: 'twitter', handle: 'https://x.com/ManyagiOfficial', label: 'Twitter' },
      { platform: 'youtube', handle: 'https://youtube.com/@ManyagiOfficial', label: 'YouTube' },
      { platform: 'pinterest', handle: 'https://pinterest.com/ManyagiOfficial', label: 'Pinterest' },
    ],
    publishing: [
      { platform: 'instagram', handle: 'https://instagram.com/manyagi_publishing', label: 'Instagram' },
      { platform: 'twitter', handle: 'https://x.com/ManyagiPublishing', label: 'Twitter' },
      { platform: 'pinterest', handle: 'https://pinterest.com/ManyagiPublishing', label: 'Pinterest' },
    ],
    designs: [
      { platform: 'instagram', handle: 'https://instagram.com/manyagi_designs', label: 'Instagram' },
      { platform: 'twitter', handle: 'https://x.com/manyagi_designs', label: 'Twitter' },
      { platform: 'tiktok', handle: 'https://tiktok.com/@manyagi_designs', label: 'TikTok' },
      { platform: 'pinterest', handle: 'https://pinterest.com/ManyagiDesigns', label: 'Pinterest' },
    ],
    capital: [
      { platform: 'linkedin', handle: 'https://linkedin.com/company/manyagi-capital', label: 'LinkedIn' },
      { platform: 'twitter', handle: 'https://x.com/ManyagiCapital', label: 'Twitter' },
      { platform: 'youtube', handle: 'https://youtube.com/@ManyagiCapital', label: 'YouTube' },
    ],
    tech: [
      { platform: 'linkedin', handle: 'https://linkedin.com/company/manyagi-tech', label: 'LinkedIn' },
      { platform: 'twitter', handle: 'https://x.com/ManyagiTech', label: 'Twitter' },
      { platform: 'instagram', handle: 'https://instagram.com/manyagi_tech', label: 'Instagram' },
      { platform: 'youtube', handle: 'https://youtube.com/@ManyagiTech', label: 'YouTube' },
    ],
    media: [
      { platform: 'youtube', handle: 'https://youtube.com/@ManyagiMedia', label: 'YouTube' },
      { platform: 'instagram', handle: 'https://instagram.com/manyagi_media', label: 'Instagram' },
      { platform: 'tiktok', handle: 'https://tiktok.com/@manyagi_media', label: 'TikTok' },
      { platform: 'twitter', handle: 'https://x.com/ManyagiMedia', label: 'Twitter' },
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

  // Reset state on route change
  useEffect(() => {
    const handleRouteChange = () => {
      // No state to reset since dropdowns are removed
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  return (
    <footer className="bg-white text-black py-5 border-t border-gray-300">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between gap-4 items-center text-center md:text-left">
        <div>© 2025 Manyagi. All rights reserved.</div>
        <div className="flex gap-4 text-sm">
          <Link href="/privacy" className="hover:text-yellow-500">Privacy</Link>
          <Link href="/terms" className="hover:text-yellow-500">Terms</Link>
          <Link href="/about" className="hover:text-yellow-500">About</Link>
        </div>
        <div className="flex gap-4 text-lg">
          {currentLinks.map((link) => (
            <a
              key={link.platform}
              href={link.handle}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="hover:text-yellow-500 transition"
            >
              {link.platform === 'instagram' && <FaInstagram />}
              {link.platform === 'tiktok' && <FaTiktok />}
              {link.platform === 'youtube' && <FaYoutube />}
              {link.platform === 'twitter' && <FaTwitter />}
              {link.platform === 'linkedin' && <FaLinkedin />}
              {link.platform === 'pinterest' && <FaPinterest />}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;