// components/Header.js
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { FaShoppingCart } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const Header = () => {
  const router = useRouter();
  const items = useSelector((state) => state.cart.items || []);
  const cartCount = items.length;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 bg-white z-50 border-b border-gray-300 text-black">
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-8 flex-col md:flex-row">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3 font-bold uppercase tracking-widest">
            <Image
              src="/images/logo.svg"
              alt="Manyagi Logo"
              width={100}
              height={50}
              loading="lazy"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap gap-4 md:gap-6 items-center justify-center md:justify-end mt-4 md:mt-0">
          <Link href="/" className="hover:text-yellow-500 transition">Home</Link>
          <Link href="/publishing" className="hover:text-yellow-500 transition">Publishing</Link>
          <Link href="/designs" className="hover:text-yellow-500 transition">Designs</Link>
          <Link href="/media" className="hover:text-yellow-500 transition">Media</Link>
          <Link href="/capital" className="hover:text-yellow-500 transition">Capital</Link>
          <Link href="/tech" className="hover:text-yellow-500 transition">Tech</Link>
          <Link href="/realty" className="hover:text-yellow-500 transition">Realty</Link>
          <Link href="/blog" className="hover:text-yellow-500 transition">Blog</Link>
          <Link href="/about" className="hover:text-yellow-500 transition">About</Link>
          <Link href="/contact" className="hover:text-yellow-500 transition">Contact</Link>
          <Link href="/links" className="hover:text-yellow-500 transition">Links</Link>
          <Link href="/admin" className="hover:text-yellow-500 transition bg-blue-100 px-2 py-1 rounded">Admin</Link>

          {/* Cart */}
          <Link href="/cart" className="relative hover:text-yellow-500 transition">
            <FaShoppingCart className="inline-block" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white transition-colors"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
