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
    // Standard Mixpanel browser snippet
    (function(e, a) {
      if (!a.__SV) {
        var b = e;
        try {
          var c,
            l,
            i,
            j = b.location,
            g = j.hash;
          c = function(a, b) {
            return (l = a.match(RegExp(b + "=([^&]*)"))) ? l[1] : null;
          };
          g &&
            c(g, "state") &&
            ((i = JSON.parse(decodeURIComponent(c(g, "state")))),
            "mpeditor" === i.action &&
              (b.sessionStorage.setItem("_mpcehash", g),
              history.replaceState(i.desiredHash || "", e.title, j.pathname + j.search)));
        } catch (m) {}
        var k, h;
        window.mixpanel = a;
        a._i = [];
        a.init = function(b, c, f) {
          function e(b, a) {
            var c = a.split(".");
            2 == c.length && ((b = b[c[0]]), (a = c[1]));
            b[a] = function() {
              b.push([a].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          var d = a;
          "undefined" !== typeof f ? (d = a[f] = []) : (f = "mixpanel");
          d.people = d.people || [];
          d.toString = function(a) {
            var b = "mixpanel";
            "mixpanel" !== f && (b += "." + f);
            a || (b += " (stub)");
            return b;
          };
          d.people.toString = function() {
            return d.toString(1) + ".people (stub)";
          };
          k =
            "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(
              " "
            );
          for (h = 0; h < k.length; h++) e(d, k[h]);
          var j = "set set_once union unset remove delete".split(" ");
          d.get_group = function() {
            function a(c) {
              b[c] = function() {
                call2_args = arguments;
                call2 = [c].concat(Array.prototype.slice.call(call2_args, 0));
                d.push([e, call2]);
              };
            }
            for (
              var b = {},
                e = ["get_group"].concat(Array.prototype.slice.call(arguments, 0)),
                c = 0;
              c < j.length;
              c++
            )
              a(j[c]);
            return b;
          };
          a._i.push([b, c, f]);
        };
        a.__SV = 1.2;
        b = e.createElement("script");
        b.type = "text/javascript";
        b.async = !0;
        b.src =
          "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL
            ? MIXPANEL_CUSTOM_LIB_URL
            : "file:" === e.location.protocol &&
              "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)
            ? "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"
            : "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
        c = e.getElementsByTagName("script")[0];
        c.parentNode.insertBefore(b, c);
      }
    })(document, window.mixpanel || []);
    mixpanel.init("d28b5a9469e93b88c4b0c2fdfec1a7b5", { autotrack: true }); // Your key; autotrack for automatic events

    // Your event tracking code remains the same (forms, page views, videos, etc.)
    const forms = document.querySelectorAll('form[action*="convertkit"]');
    forms.forEach(form => {
      form.addEventListener('submit', () => {
        if (typeof mixpanel !== 'undefined' && mixpanel.track) {
          mixpanel.track('Sign Up', {
            country: navigator.language.split('-')[1] || 'Unknown',
            os: navigator.platform,
            source: document.referrer || window.location.pathname,
            form: 'Subscription',
            page: window.location.pathname,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    // Page View
    if (typeof mixpanel !== 'undefined' && mixpanel.track) {
      mixpanel.track('Page View', {
        page_name: window.location.pathname,
        referrer_url_path: document.referrer || 'Direct',
        page: window.location.pathname,
        referrer: document.referrer || 'Direct',
        duration: 0 // Update on page unload
      });
    }
    window.addEventListener('unload', () => {
      const duration = (Date.now() - performance.timing.navigationStart) / 1000;
      if (typeof mixpanel !== 'undefined' && mixpanel.track) {
        mixpanel.track('Page View', { duration });
      }
    });

    // Video Play
    const videos = document.querySelectorAll('video, iframe[src*="youtube"]');
    videos.forEach(video => {
      video.addEventListener('play', () => {
        if (typeof mixpanel !== 'undefined' && mixpanel.track) {
          mixpanel.track('Video Play', {
            video: video.src || video.getAttribute('src'),
            page: window.location.pathname,
            duration: 0, // Update with video API if available
            type: video.dataset.type || 'Narration'
          });
        }
      });
    });

    // App Download
    const downloadLinks = document.querySelectorAll('a[href*="daito"]');
    downloadLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (typeof mixpanel !== 'undefined' && mixpanel.track) {
          mixpanel.track('App Download', {
            platform: link.href.includes('itunes') ? 'iOS' : 'Android',
            source: document.referrer || window.location.pathname,
            version: '1.0.0' // Update with actual version
          });
        }
      });
    });

    // Product Purchase
    window.addEventListener('purchase', (e) => {
      if (typeof mixpanel !== 'undefined' && mixpanel.track) {
        mixpanel.track('Product Purchase', {
          item: e.detail.item,
          price: e.detail.price,
          quantity: e.detail.quantity || 1,
          category: e.detail.category || 'Clothing'
        });
      }
    });

    // Subscription Start
    window.addEventListener('subscription', (e) => {
      if (typeof mixpanel !== 'undefined' && mixpanel.track) {
        mixpanel.track('Subscription Start', {
          plan: e.detail.plan,
          amount: e.detail.amount,
          payment_method: e.detail.payment_method || 'Stripe',
          duration: e.detail.duration || 'monthly'
        });
      }
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