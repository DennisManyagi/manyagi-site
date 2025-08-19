import '../styles/globals.css';
import { Provider } from 'react-redux';
import { store } from '../lib/store';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SessionProvider } from "next-auth/react";
import { useEffect } from 'react';
import { ParallaxProvider } from 'react-scroll-parallax';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    // Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-N05K791ESR';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-N05K791ESR');

    // Custom cursor
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    const moveCursor = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    const addHover = () => cursor.classList.add('cursor--hover');
    const removeHover = () => cursor.classList.remove('cursor--hover');

    document.addEventListener('mousemove', moveCursor);
    document.querySelectorAll('a, button, .card').forEach((el) => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.body.removeChild(cursor);
    };
  }, []);

  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <ParallaxProvider>
          <div className={store.getState().darkMode.isDark ? 'dark' : ''}>
            <Header />
            <main className="container mx-auto px-4 py-8 min-h-screen bg-white text-black gradient-bg">
              <Component {...pageProps} />
            </main>
            <Footer />
          </div>
        </ParallaxProvider>
      </Provider>
    </SessionProvider>
  );
}

export default MyApp;