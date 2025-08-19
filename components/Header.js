import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode } from '../lib/darkModeSlice';
import { FaSun, FaMoon, FaShoppingCart } from 'react-icons/fa';
import Image from 'next/image';

const Header = () => {
  const isDark = useSelector((state) => state.darkMode.isDark);
  const cartItems = useSelector((state) => state.cart.items.length);
  const dispatch = useDispatch();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 bg-white backdrop-blur-md z-10 border-b border-gray-300 text-black glass"
      aria-label="Main navigation"
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 font-bold uppercase tracking-widest">
          <Image src="/images/logo.png" alt="Manyagi Logo" width={100} height={50} loading="lazy" />
        </Link>
        <nav className="flex flex-wrap gap-4 md:gap-6 items-center justify-center md:justify-end">
          <Link href="/" className="hover:text-yellow-500 hover:scale-105 transition">Home</Link>
          <Link href="/publishing" className="hover:text-yellow-500 hover:scale-105 transition">Publishing</Link>
          <Link href="/designs" className="hover:text-yellow-500 hover:scale-105 transition">Designs</Link>
          <Link href="/media" className="hover:text-yellow-500 hover:scale-105 transition">Media</Link>
          <Link href="/capital" className="hover:text-yellow-500 hover:scale-105 transition">Capital</Link>
          <Link href="/tech" className="hover:text-yellow-500 hover:scale-105 transition">Tech</Link>
          <Link href="/about" className="hover:text-yellow-500 hover:scale-105 transition">About</Link>
          <Link href="/contact" className="hover:text-yellow-500 hover:scale-105 transition">Contact</Link>
          <Link href="/cart" className="relative hover:text-yellow-500 hover:scale-105 transition">
            <FaShoppingCart />
            {cartItems > 0 && <span className="absolute -top-1 -right-2 bg-yellow-500 text-black text-xs rounded-full px-1">{cartItems}</span>}
          </Link>
          <button onClick={() => dispatch(toggleDarkMode())} className="ml-4" aria-label={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? <FaSun className="hover:rotate-180 transition" /> : <FaMoon className="hover:rotate-180 transition" />}
          </button>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;