import '../styles/globals.css';
import { Provider } from 'react-redux';
import { store } from '../lib/store';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/ErrorBoundary';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      try {
        localStorage.setItem('cart', JSON.stringify(store.getState().cart.items || []));
      } catch (e) {
        console.error('Cart persist error:', e);
      }
    });
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        store.dispatch({ type: 'cart/setItems', payload: JSON.parse(savedCart) });
      }
    } catch (e) {
      console.error('Cart load error:', e);
    }
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, { page_path: url });
      }
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`} />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
        <Script id="ga-events" strategy="afterInteractive">
          {`
            function safeGtag() {
              return (typeof window !== 'undefined' && typeof window.gtag === 'function') ? window.gtag : null;
            }
            document.querySelectorAll('form').forEach(form => {
              form.addEventListener('submit', () => {
                const g = safeGtag(); if (g) g('event', 'form_submission', { formId: form.id || 'unknown' });
              });
            });
            const g = safeGtag(); if (g) g('event', 'page_view', { page_path: window.location.pathname });
            document.querySelectorAll('video, iframe[src*="youtube"]').forEach(video => {
              video.addEventListener('play', () => {
                const g = safeGtag(); if (g) g('event', 'video_play', { video: video.src || 'inline' });
              });
            });
            document.querySelectorAll('a[href*="app"]').forEach(link => {
              link.addEventListener('click', () => {
                const g = safeGtag(); if (g) g('event', 'app_download', { link: link.href });
              });
            });
            window.addEventListener('purchase', (e) => { const g = safeGtag(); if (g) g('event', 'purchase', e.detail); });
            window.addEventListener('subscription', (e) => { const g = safeGtag(); if (g) g('event', 'subscription', e.detail); });
          `}
        </Script>
        <Header />
        <main className="container mx-auto px-4 py-8 min-h-screen bg-white text-black gradient-bg">
          <Component {...pageProps} />
        </main>
        <Footer />
      </ErrorBoundary>
    </Provider>
  );
}

export default MyApp;
