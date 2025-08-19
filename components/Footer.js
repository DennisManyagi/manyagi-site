import Link from 'next/link';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaLinkedin, FaPinterest } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-8 border-t border-neutral-800">
      <div className="container mx-auto px-4 flex flex-wrap justify-between gap-6">
        <div>© 2025 Manyagi. All rights reserved.</div>
        <div className="flex gap-4 text-sm">
          <Link href="/privacy" className="hover:text-gold">Privacy</Link>
          <Link href="/terms" className="hover:text-gold">Terms</Link>
          <Link href="/about" className="hover:text-gold">About</Link>
        </div>
        <div className="flex gap-4 text-sm">
          <a href="https://instagram.com/manyagi" aria-label="Manyagi Instagram"><FaInstagram className="hover:text-gold" /></a>
          <a href="https://tiktok.com/@manyagi" aria-label="Manyagi TikTok"><FaTiktok className="hover:text-gold" /></a>
          <a href="https://youtube.com/@manyagi_media" aria-label="Manyagi YouTube"><FaYoutube className="hover:text-gold" /></a>
          <a href="https://twitter.com/manyagi" aria-label="Manyagi Twitter"><FaTwitter className="hover:text-gold" /></a>
          <a href="https://linkedin.com/company/manyagi" aria-label="Manyagi LinkedIn"><FaLinkedin className="hover:text-gold" /></a>
          <a href="https://pinterest.com/manyagi" aria-label="Manyagi Pinterest"><FaPinterest className="hover:text-gold" /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;