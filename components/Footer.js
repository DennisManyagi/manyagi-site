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
    <footer className="bg-purple-900 text-white py-10 border-t border-neutral-800 glass">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between gap-6 items-center text-center md:text-left">
        <div>© 2025 Manyagi. All rights reserved.</div>
        <div className="flex gap-4 text-sm">
          <Link href="/privacy" className="hover:text-gold">Privacy</Link>
          <Link href="/terms" className="hover:text-gold">Terms</Link>
          <Link href="/about" className="hover:text-gold">About</Link>
        </div>
        <div className="flex gap-4 text-lg relative">
          <div className="relative">
            <button onClick={() => setIsInstagramOpen(!isInstagramOpen)} aria-label="Instagram Dropdown">
              <FaInstagram className="hover:text-gold hover:scale-110 transition" />
            </button>
            {isInstagramOpen && (
              <div className="absolute bottom-full mb-2 bg-white text-black p-2 rounded shadow-lg">
                <a href="https://instagram.com/manyagi.official" target="_blank" rel="noopener noreferrer">Manyagi (Parent)</a><br />
                <a href="https://instagram.com/manyagi_publishing" target="_blank" rel="noopener noreferrer">Publishing</a><br />
                <a href="https://instagram.com/manyagi_designs" target="_blank" rel="noopener noreferrer">Designs</a><br />
                <a href="https://instagram.com/manyagi_media" target="_blank" rel="noopener noreferrer">Media</a><br />
                <a href="https://instagram.com/manyagi_capital" target="_blank" rel="noopener noreferrer">Capital</a><br />
                <a href="https://instagram.com/manyagi_tech" target="_blank" rel="noopener noreferrer">Tech</a>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setIsTiktokOpen(!isTiktokOpen)} aria-label="TikTok Dropdown">
              <FaTiktok className="hover:text-gold hover:scale-110 transition" />
            </button>
            {isTiktokOpen && (
              <div className="absolute bottom-full mb-2 bg-white text-black p-2 rounded shadow-lg">
                <a href="https://tiktok.com/@manyagi.official" target="_blank" rel="noopener noreferrer">Manyagi (Parent)</a><br />
                <a href="https://tiktok.com/@manyagi_designs" target="_blank" rel="noopener noreferrer">Designs</a><br />
                <a href="https://tiktok.com/@manyagi_media" target="_blank" rel="noopener noreferrer">Media</a>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setIsYoutubeOpen(!isYoutubeOpen)} aria-label="YouTube Dropdown">
              <FaYoutube className="hover:text-gold hover:scale-110 transition" />
            </button>
            {isYoutubeOpen && (
              <div className="absolute bottom-full mb-2 bg-white text-black p-2 rounded shadow-lg">
                <a href="https://youtube.com/@ManyagiOfficial" target="_blank" rel="noopener noreferrer">Manyagi (Parent)</a><br />
                <a href="https://youtube.com/@ManyagiMedia" target="_blank" rel="noopener noreferrer">Media</a><br />
                <a href="https://youtube.com/@ManyagiCapital" target="_blank" rel="noopener noreferrer">Capital</a><br />
                <a href="https://youtube.com/@ManyagiTech" target="_blank" rel="noopener noreferrer">Tech</a>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setIsTwitterOpen(!isTwitterOpen)} aria-label="Twitter Dropdown">
              <FaTwitter className="hover:text-gold hover:scale-110 transition" />
            </button>
            {isTwitterOpen && (
              <div className="absolute bottom-full mb-2 bg-white text-black p-2 rounded shadow-lg">
                <a href="https://twitter.com/ManyagiOfficial" target="_blank" rel="noopener noreferrer">Manyagi (Parent)</a><br />
                <a href="https://twitter.com/ManyagiPublishing" target="_blank" rel="noopener noreferrer">Publishing</a><br />
                <a href="https://twitter.com/manyagi_designs" target="_blank" rel="noopener noreferrer">Designs</a><br />
                <a href="https://twitter.com/ManyagiMedia" target="_blank" rel="noopener noreferrer">Media</a><br />
                <a href="https://twitter.com/ManyagiCapital" target="_blank" rel="noopener noreferrer">Capital</a><br />
                <a href="https://twitter.com/ManyagiTech" target="_blank" rel="noopener noreferrer">Tech</a>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setIsLinkedinOpen(!isLinkedinOpen)} aria-label="LinkedIn Dropdown">
              <FaLinkedin className="hover:text-gold hover:scale-110 transition" />
            </button>
            {isLinkedinOpen && (
              <div className="absolute bottom-full mb-2 bg-white text-black p-2 rounded shadow-lg">
                <a href="https://linkedin.com/company/manyagi" target="_blank" rel="noopener noreferrer">Manyagi (Parent)</a><br />
                <a href="https://linkedin.com/company/manyagi-capital" target="_blank" rel="noopener noreferrer">Capital</a><br />
                <a href="https://linkedin.com/company/manyagi-tech" target="_blank" rel="noopener noreferrer">Tech</a>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setIsPinterestOpen(!isPinterestOpen)} aria-label="Pinterest Dropdown">
              <FaPinterest className="hover:text-gold hover:scale-110 transition" />
            </button>
            {isPinterestOpen && (
              <div className="absolute bottom-full mb-2 bg-white text-black p-2 rounded shadow-lg">
                <a href="https://pinterest.com/ManyagiOfficial" target="_blank" rel="noopener noreferrer">Manyagi (Parent)</a><br />
                <a href="https://pinterest.com/ManyagiDesigns" target="_blank" rel="noopener noreferrer">Designs</a><br />
                <a href="https://pinterest.com/ManyagiPublishing" target="_blank" rel="noopener noreferrer">Publishing</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;