import Link from 'next/link';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="site-footer border-t border-line mt-12 py-6 text-muted" aria-label="Site footer">
      <div className="container flex justify-between items-center flex-wrap gap-4">
        <div>© 2025 Manyagi Management LLC. All rights reserved.</div>
        <div className="flex gap-4">
          <Link href="/privacy" className="text-fg opacity-90 hover:opacity-100">Privacy</Link>
          <Link href="/terms" className="text-fg opacity-90 hover:opacity-100">Terms</Link>
          <a href="https://instagram.com/manyagi_designs" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
          <a href="https://tiktok.com/@manyagi" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><FaTiktok /></a>
          <a href="https://youtube.com/@manyagi" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
          <a href="https://x.com/manyagi" target="_blank" rel="noopener noreferrer" aria-label="X"><FaTwitter /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;