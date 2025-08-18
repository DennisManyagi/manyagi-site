import Link from 'next/link';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaLinkedin, FaPinterest } from 'react-icons/fa';
import { useState } from 'react';

const Footer = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <footer className="bg-gray-800 text-white py-8 border-t border-gray-600">
      <div className="container mx-auto px-4 flex flex-wrap justify-between gap-6">
        <div>© 2025 Manyagi. All rights reserved.</div>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-yellow-400">Privacy</Link>
          <Link href="/terms" className="hover:text-yellow-400">Terms</Link>
          <Link href="/publishing" className="hover:text-yellow-400">Publishing</Link>
          <Link href="/designs" className="hover:text-yellow-400">Designs</Link>
          <Link href="/capital" className="hover:text-yellow-400">Capital</Link>
          <Link href="/tech" className="hover:text-yellow-400">Tech</Link>
          <Link href="/media" className="hover:text-yellow-400">Media</Link>
        </div>
        <div className="flex gap-4 text-2xl relative">
          <div className="relative">
            <button onClick={() => toggleDropdown('instagram')} className="hover:text-yellow-400">Instagram</button>
            {openDropdown === 'instagram' && (
              <div className="absolute bottom-full bg-gray-700 p-2 rounded">
                <a href="https://instagram.com/manyagi" className="block hover:text-yellow-400">@manyagi</a>
                <a href="https://instagram.com/manyagi_publishing" className="block hover:text-yellow-400">@manyagi_publishing</a>
                <a href="https://instagram.com/manyagi_designs" className="block hover:text-yellow-400">@manyagi_designs</a>
                <a href="https://instagram.com/manyagi_media" className="block hover:text-yellow-400">@manyagi_media</a>
                <a href="https://instagram.com/manyagi_tech" className="block hover:text-yellow-400">@manyagi_tech</a>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => toggleDropdown('tiktok')} className="hover:text-yellow-400">TikTok</button>
            {openDropdown === 'tiktok' && (
              <div className="absolute bottom-full bg-gray-700 p-2 rounded">
                <a href="https://tiktok.com/@manyagi" className="block hover:text-yellow-400">@manyagi</a>
                <a href="https://tiktok.com/@manyagi_publishing" className="block hover:text-yellow-400">@manyagi_publishing</a>
                <a href="https://tiktok.com/@manyagi_designs" className="block hover:text-yellow-400">@manyagi_designs</a>
                <a href="https://tiktok.com/@manyagi_media" className="block hover:text-yellow-400">@manyagi_media</a>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => toggleDropdown('twitter')} className="hover:text-yellow-400">X</button>
            {openDropdown === 'twitter' && (
              <div className="absolute bottom-full bg-gray-700 p-2 rounded">
                <a href="https://x.com/manyagi" className="block hover:text-yellow-400">@manyagi</a>
                <a href="https://x.com/manyagi_publishing" className="block hover:text-yellow-400">@manyagi_publishing</a>
                <a href="https://x.com/manyagi_capital" className="block hover:text-yellow-400">@manyagi_capital</a>
                <a href="https://x.com/manyagi_tech" className="block hover:text-yellow-400">@manyagi_tech</a>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => toggleDropdown('youtube')} className="hover:text-yellow-400">YouTube</button>
            {openDropdown === 'youtube' && (
              <div className="absolute bottom-full bg-gray-700 p-2 rounded">
                <a href="https://youtube.com/@manyagi" className="block hover:text-yellow-400">@manyagi</a>
                <a href="https://youtube.com/@manyagi_publishing" className="block hover:text-yellow-400">@manyagi_publishing</a>
                <a href="https://youtube.com/@manyagi_capital" className="block hover:text-yellow-400">@manyagi_capital</a>
                <a href="https://youtube.com/@manyagi_media" className="block hover:text-yellow-400">@manyagi_media</a>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => toggleDropdown('linkedin')} className="hover:text-yellow-400">LinkedIn</button>
            {openDropdown === 'linkedin' && (
              <div className="absolute bottom-full bg-gray-700 p-2 rounded">
                <a href="https://linkedin.com/company/manyagi" className="block hover:text-yellow-400">Manyagi</a>
                <a href="https://linkedin.com/company/manyagi_tech" className="block hover:text-yellow-400">Manyagi Tech</a>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => toggleDropdown('pinterest')} className="hover:text-yellow-400">Pinterest</button>
            {openDropdown === 'pinterest' && (
              <div className="absolute bottom-full bg-gray-700 p-2 rounded">
                <a href="https://pinterest.com/manyagi_designs" className="block hover:text-yellow-400">@manyagi_designs</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;