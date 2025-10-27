// pages/_app.js
import '@/styles/globals.css';
import { Provider } from 'react-redux';
import { store } from '../lib/store';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/ErrorBoundary';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import SEO from '@/components/SEO';

// 🔥 NEW: track affiliate codes from URL (?ref=ABC)
import { rememberAffiliateFromURL } from '@/lib/affiliate';

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // 🔥 NEW: capture & persist affiliate referral code from URL (once per mount / nav)
  useEffect(() => {
    rememberAffiliateFromURL();
  }, []);

  // Persist cart between refreshes
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      try {
        localStorage.setItem(
          'cart',
          JSON.stringify(store.getState().cart.items || [])
        );
      } catch {
        /* ignore */
      }
    });

    try {
      const saved = localStorage.getItem('cart');
      if (saved)
        store.dispatch({
          type: 'cart/setItems',
          payload: JSON.parse(saved),
        });
    } catch {
      /* ignore */
    }

    return unsubscribe;
  }, []);

  // Google Analytics: track route changes
  useEffect(() => {
    if (!GA_ID) return;
    const handleRouteChange = (url) => {
      if (
        typeof window !== 'undefined' &&
        typeof window.gtag === 'function'
      ) {
        window.gtag('config', GA_ID, { page_path: url });
      }
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () =>
      router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Head>
          {/* Viewport + icons */}
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {GA_ID ? (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        ) : null}

        <ThemeProvider attribute="class" defaultTheme="light">
          {/* Global SEO defaults; pages can override with their own <SEO .../> */}
          <SEO />

          <div className="min-h-screen gradient-bg dark:bg-gray-900 transition-colors">
            <Header />
            <main className="container mx-auto px-4 py-8 min-h-screen bg-white text-black gradient-bg">
              <Component {...pageProps} />
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </ErrorBoundary>
    </Provider>
  );
}

export default MyApp;
