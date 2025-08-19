import Link from 'next/link';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaLinkedin, FaPinterest } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-10 border-t border-neutral-800 glass">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between gap-6 items-center text-center md:text-left">
        <div>© 2025 Manyagi. All rights reserved.</div>
        <div className="flex gap-4 text-sm">
          <Link href="/privacy" className="hover:text-gold">Privacy</Link>
          <Link href="/terms" className="hover:text-gold">Terms</Link>
          <Link href="/about" className="hover:text-gold">About</Link>
        </div>
        <div className="flex gap-4 text-lg">
          <a href="https://instagram.com/manyagi" aria-label="Instagram"><FaInstagram className="hover:text-gold hover:scale-110 transition" /></a>
          <a href="https://tiktok.com/@manyagi" aria-label="TikTok"><FaTiktok className="hover:text-gold hover:scale-110 transition" /></a>
          <a href="https://youtube.com/@manyagi_media" aria-label="YouTube"><FaYoutube className="hover:text-gold hover:scale-110 transition" /></a>
          <a href="https://twitter.com/manyagi" aria-label="Twitter"><FaTwitter className="hover:text-gold hover:scale-110 transition" /></a>
          <a href="https://linkedin.com/company/manyagi" aria-label="LinkedIn"><FaLinkedin className="hover:text-gold hover:scale-110 transition" /></a>
          <a href="https://pinterest.com/manyagi" aria-label="Pinterest"><FaPinterest className="hover:text-gold hover:scale-110 transition" /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;