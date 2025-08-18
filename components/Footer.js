import Link from 'next/link';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaLinkedin, FaPinterest } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-8 border-t border-neutral-800">
      <div className="container mx-auto px-4 flex flex-wrap justify-between gap-6">
        <div>© 2025 Manyagi. All rights reserved.</div>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-gold">Privacy</Link>
          <Link href="/terms" className="hover:text-gold">Terms</Link>
        </div>
        <div className="flex gap-4 text-2xl">
          <a href="https://instagram.com/manyagi" aria-label="Manyagi Main Instagram"><FaInstagram className="hover:text-gold" /></a>
          <a href="https://instagram.com/manyagi_publishing" aria-label="Publishing Instagram"><FaInstagram className="hover:text-gold" /></a>
          <a href="https://instagram.com/manyagi_designs" aria-label="Designs Instagram"><FaInstagram className="hover:text-gold" /></a>
          <a href="https://instagram.com/manyagi_media" aria-label="Media Instagram"><FaInstagram className="hover:text-gold" /></a>
          <a href="https://instagram.com/manyagi_tech" aria-label="Tech Instagram"><FaInstagram className="hover:text-gold" /></a>
          <a href="https://tiktok.com/@manyagi" aria-label="Manyagi Main TikTok"><FaTiktok className="hover:text-gold" /></a>
          <a href="https://tiktok.com/@manyagi_publishing" aria-label="Publishing TikTok"><FaTiktok className="hover:text-gold" /></a>
          <a href="https://tiktok.com/@manyagi_designs" aria-label="Designs TikTok"><FaTiktok className="hover:text-gold" /></a>
          <a href="https://tiktok.com/@manyagi_media" aria-label="Media TikTok"><FaTiktok className="hover:text-gold" /></a>
          <a href="https://x.com/manyagi" aria-label="Manyagi Main X"><FaTwitter className="hover:text-gold" /></a>
          <a href="https://x.com/manyagi_publishing" aria-label="Publishing X"><FaTwitter className="hover:text-gold" /></a>
          <a href="https://x.com/manyagi_capital" aria-label="Capital X"><FaTwitter className="hover:text-gold" /></a>
          <a href="https://x.com/manyagi_tech" aria-label="Tech X"><FaTwitter className="hover:text-gold" /></a>
          <a href="https://youtube.com/@manyagi" aria-label="Manyagi Main YouTube"><FaYoutube className="hover:text-gold" /></a>
          <a href="https://youtube.com/@manyagi_publishing" aria-label="Publishing YouTube"><FaYoutube className="hover:text-gold" /></a>
          <a href="https://youtube.com/@manyagi_capital" aria-label="Capital YouTube"><FaYoutube className="hover:text-gold" /></a>
          <a href="https://youtube.com/@manyagi_media" aria-label="Media YouTube"><FaYoutube className="hover:text-gold" /></a>
          <a href="https://linkedin.com/company/manyagi" aria-label="Manyagi Main LinkedIn"><FaLinkedin className="hover:text-gold" /></a>
          <a href="https://linkedin.com/company/manyagi_tech" aria-label="Tech LinkedIn"><FaLinkedin className="hover:text-gold" /></a>
          <a href="https://pinterest.com/manyagi_designs" aria-label="Designs Pinterest"><FaPinterest className="hover:text-gold" /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;