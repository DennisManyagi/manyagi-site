// components/Header.js
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();
  const headerHeight = router.pathname.includes('publishing') ? 'h-[80px]' : router.pathname.includes('capital') ? 'h-[70px]' : 'h-[60px]';

  return (
    <header className={`sticky top-0 bg-white z-50 border-b border-gray-300 text-black ${headerHeight}`}>
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 font-bold uppercase tracking-widest">
          <Image src="/images/logo.webp" alt="Manyagi Logo" width={100} height={50} loading="lazy" />
        </Link>
        <nav className="flex flex-wrap gap-4 md:gap-6 items-center justify-center md:justify-end">
          <Link href="/" className="hover:text-yellow-500 transition">Home</Link>
          <Link href="/publishing" className="hover:text-yellow-500 transition">Publishing</Link>
          <Link href="/designs" className="hover:text-yellow-500 transition">Designs</Link>
          <Link href="/media" className="hover:text-yellow-500 transition">Media</Link>
          <Link href="/capital" className="hover:text-yellow-500 transition">Capital</Link>
          <Link href="/tech" className="hover:text-yellow-500 transition">Tech</Link>
          <Link href="/blog" className="hover:text-yellow-500 transition">Blog</Link>
          <Link href="/about" className="hover:text-yellow-500 transition">About</Link>
          <Link href="/contact" className="hover:text-yellow-500 transition">Contact</Link>
          <Link href="/links" className="hover:text-yellow-500 transition">Links</Link>
          <Link href="/cart" className="hover:text-yellow-500 transition">Cart</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;