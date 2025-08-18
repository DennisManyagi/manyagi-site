import '../styles/globals.css';
import { Provider } from 'react-redux';
import { store } from '../lib/store';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
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
  }, []);

  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <ParallaxProvider>
          <div className={store.getState().darkMode.isDark ? 'dark' : ''}>
            <Header />
            <main className="container mx-auto px-4 py-8 min-h-screen">
              <Component {...pageProps} />
            </main>
            <Footer />
            <Chat />
          </div>
        </ParallaxProvider>
      </Provider>
    </SessionProvider>
  );
}

export default MyApp;