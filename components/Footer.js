// components/Footer.js
import Link from 'next/link';
import { FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaLinkedin, FaPinterest } from 'react-icons/fa';
import { useState } from 'react';

const Footer = () => {
  const [isInstagramOpen, setIsInstagramOpen] = useState(false);
  const [isTiktokOpen, setIsTiktokOpen] = useState(false);
  const [isYoutubeOpen, setIsYoutubeOpen] = useState(false);
  const [isTwitterOpen, setIsTwitterOpen] = useState(false);
  const [isLinkedinOpen, setIsLinkedinOpen] = useState(false);
  const [isPinterestOpen, setIsPinterestOpen] = useState(false);

  return (
    <footer className="bg-white text-black py-4 border-t border-gray-300">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between gap-4 items-center text-center md:text-left">
        <div>© 2025 Manyagi. All rights reserved.</div>
        <div className="flex gap-4 text-sm">
          <Link href="/privacy" className="hover:text-yellow-500">Privacy</Link>
          <Link href="/terms" className="hover:text-yellow-500">Terms</Link>
          <Link href="/about" className="hover:text-yellow-500">About</Link>
        </div>
        <div className="flex gap-4 text-lg relative">
          {/* Dropdowns for social, like Disney's simple links but with your dropdowns */}
          <button onClick={() => setIsInstagramOpen(!isInstagramOpen)} aria-label="Instagram">
            <FaInstagram className="hover:text-yellow-500 transition" />
          </button>
          {isInstagramOpen && (
            <div className="absolute bottom-full mb-2 bg-white text-black p-2 rounded shadow-lg left-0">
              <a href="https://instagram.com/manyagi.official" target="_blank" rel="noopener noreferrer">Manyagi (Parent)</a><br />
              {/* ... other links ... */}
            </div>
          )}
          {/* Similar for other icons */}
          <button onClick={() => setIsTiktokOpen(!isTiktokOpen)} aria-label="TikTok">
            <FaTiktok className="hover:text-yellow-500 transition" />
          </button>
          {isTiktokOpen && (
            <div className="absolute bottom-full mb-2 bg-white text-black p-2 rounded shadow-lg left-0">
              <a href="https://tiktok.com/@manyagi.official" target="_blank" rel="noopener noreferrer">Manyagi (Parent)</a><br />
              {/* ... */}
            </div>
          )}
          {/* Repeat for YouTube, Twitter, LinkedIn, Pinterest */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;