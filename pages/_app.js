// pages/_app.js
import '../styles/globals.css';
import { Provider } from 'react-redux';
import { store } from '../lib/store';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { ParallaxProvider } from 'react-scroll-parallax';

// Hotjar Tracking Code
const HotjarInit = () => {
  useEffect(() => {
    (function(h, o, t, j, a, r) {
      h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
      h._hjSettings = { hjid: 6497748, hjsv: 6 }; // Your Hotjar Site ID
      a = o.getElementsByTagName('head')[0];
      r = o.createElement('script'); r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
  }, []);
};

// Mixpanel Tracking Code
const MixpanelInit = () => {
  useEffect(() => {
    (function(c, a) {
      if (!a.__SV) {
        var t = window; t.Mixpanel = a; a._i = []; a.init = function(e, o) {
          a._i.push([e, o]);
        };
        // Consolidated init with autocapture
        a.init('d28b5a9469e93b88c4b0c2fdfec1a7b5', { autocapture: true });
        var u = c.createElement('script');
        u.type = 'text/javascript'; u.async = true;
        u.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
        var s = c.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(u, s);
      }
    })(document, window.mixpanel || []);

    // Sign Up (rest of the code remains the same)
    const forms = document.querySelectorAll('form[action*="convertkit"]');
    forms.forEach(form => {
      form.addEventListener('submit', () => {
        mixpanel.track('Sign Up', {
          country: navigator.language.split('-')[1] || 'Unknown',
          os: navigator.platform,
          source: document.referrer || window.location.pathname,
          form: 'Subscription',
          page: window.location.pathname,
          timestamp: new Date().toISOString()
        });
      });
    });

    // Page View (rest remains the same)
    mixpanel.track('Page View', {
      page_name: window.location.pathname,
      referrer_url_path: document.referrer || 'Direct',
      page: window.location.pathname,
      referrer: document.referrer || 'Direct',
      duration: 0 // Update on page unload
    });
    window.addEventListener('unload', () => {
      const duration = (Date.now() - performance.timing.navigationStart) / 1000;
      mixpanel.track('Page View', { duration });
    });

    // Video Play (rest remains the same)
    const videos = document.querySelectorAll('video, iframe[src*="youtube"]');
    videos.forEach(video => {
      video.addEventListener('play', () => {
        mixpanel.track('Video Play', {
          video: video.src || video.getAttribute('src'),
          page: window.location.pathname,
          duration: 0, // Update with video API if available
          type: video.dataset.type || 'Narration'
        });
      });
    });

    // App Download (rest remains the same)
    const downloadLinks = document.querySelectorAll('a[href*="daito"]');
    downloadLinks.forEach(link => {
      link.addEventListener('click', () => {
        mixpanel.track('App Download', {
          platform: link.href.includes('itunes') ? 'iOS' : 'Android',
          source: document.referrer || window.location.pathname,
          version: '1.0.0' // Update with actual version
        });
      });
    });

    // Product Purchase (rest remains the same)
    window.addEventListener('purchase', (e) => {
      mixpanel.track('Product Purchase', {
        item: e.detail.item,
        price: e.detail.price,
        quantity: e.detail.quantity || 1,
        category: e.detail.category || 'Clothing'
      });
    });

    // Subscription Start (rest remains the same)
    window.addEventListener('subscription', (e) => {
      mixpanel.track('Subscription Start', {
        plan: e.detail.plan,
        amount: e.detail.amount,
        payment_method: e.detail.payment_method || 'Stripe',
        duration: e.detail.duration || 'monthly'
      });
    });
  }, []);
};

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    // Google Analytics (existing)
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-N05K791ESR';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-N05K791ESR');

    // Custom cursor (existing)
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
            <HotjarInit />
            <MixpanelInit />
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