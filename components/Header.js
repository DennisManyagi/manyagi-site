import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode } from '../lib/darkModeSlice';
import { FaSun, FaMoon, FaShoppingCart } from 'react-icons/fa';

const Header = () => {
  const isDark = useSelector((state) => state.darkMode.isDark);
  const cartItems = useSelector((state) => state.cart.items.length);
  const dispatch = useDispatch();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-line"
      aria-label="Main navigation"
    >
      <div className="container header-inner flex items-center justify-between py-4">
        <Link href="/" className="brand flex items-center gap-3 font-bold uppercase tracking-widest text-fg">
          <span className="dot w-2.5 h-2.5 rounded-full bg-accent"></span> MANYAGI
        </Link>
        <nav className="nav flex gap-6">
          <Link href="/" className="text-fg opacity-90 hover:opacity-100 hover:border-b-2 border-accent">Home</Link>
          <Link href="/publishing" className="text-fg opacity-90 hover:opacity-100 hover:border-b-2 border-accent">Publishing</Link>
          <Link href="/designs" className="text-fg opacity-90 hover:opacity-100 hover:border-b-2 border-accent">Designs</Link>
          <Link href="/media" className="text-fg opacity-90 hover:opacity-100 hover:border-b-2 border-accent">Media</Link>
          <Link href="/capital" className="text-fg opacity-90 hover:opacity-100 hover:border-b-2 border-accent">Capital</Link>
          <Link href="/tech" className="text-fg opacity-90 hover:opacity-100 hover:border-b-2 border-accent">Tech</Link>
          <Link href="/blog" className="text-fg opacity-90 hover:opacity-100 hover:border-b-2 border-accent">Blog</Link>
          <Link href="/about" className="text-fg opacity-90 hover:opacity-100 hover:border-b-2 border-accent">About</Link>
          <Link href="/contact" className="text-fg opacity-90 hover:opacity-100 hover:border-b-2 border-accent">Contact</Link>
          <Link href="/cart" className="relative text-fg opacity-90 hover:opacity-100">
            <FaShoppingCart />
            {cartItems > 0 && <span className="absolute -top-1 -right-2 bg-accent text-bg text-xs rounded-full px-1">{cartItems}</span>}
          </Link>
          <button onClick={() => dispatch(toggleDarkMode())} className="ml-4 text-fg" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? <FaSun /> : <FaMoon />}
          </button>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;