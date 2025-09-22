// pages/_app.js
import '../styles/globals.css';
import { Provider } from 'react-redux';
import { store } from '../lib/store';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Persist cart to localStorage
    const unsubscribe = store.subscribe(() => {
      localStorage.setItem('cart', JSON.stringify(store.getState().cart.items));
    });
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      store.dispatch({ type: 'cart/setItems', payload: JSON.parse(savedCart) });
    }
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleRouteChange = (url) => {
      window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, { page_path: url });
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return (
    <Provider store={store}>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`} />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');`}
      </Script>
      <Script strategy="afterInteractive">
        {`(function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:6497748,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
      </Script>
      <Script strategy="afterInteractive">
        {`(function(e,a){
          if(!a.__SV){var b=window;try{var c,l,i,j=b.location,g=j.hash;c=function(a,b){return(l=a.match(RegExp(b+"=([^&]*)")))?l[1]:null};g&&c(g,"state")&&(i=JSON.parse(decodeURIComponent(c(g,"state"))),"mpeditor"===i.action&&(b.sessionStorage.setItem("_mpcehash",g),history.replaceState(i.desiredHash||"",e.title,j.pathname+j.search)) }catch(m){}var k,h;window.mixpanel=a;a._i=[];a.init=function(b,c,f){function e(b,a){var c=a.split(".");2==c.length&&(b=b[c[0]],a=c[1]);b[a]=function(){b.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var d=a;"undefined" !==typeof f?d=a[f]=[]:f="mixpanel";d.people=d.people||[];d.toString=function(a){var b="mixpanel";"mixpanel"!==f&&(b+= "."+f);a||(b+=" (stub)");return b};d.people.toString=function(){return d.toString(1)+".people (stub)"};k="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for(h=0;h<k.length;h++)e(d,k[h]);a._i.push([b,c,f])};a.__SV=1.2;b=e.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";c=e.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c)}})(document,window.mixpanel||[]);
        mixpanel.init("d28b5a9469e93b88c4b0c2fdfec1a7b5");`}
      </Script>
      <Script id="mixpanel-events" strategy="afterInteractive">
        {`
          // Form Submission
          document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', () => {
              mixpanel.track('Form Submission', { formId: form.id || 'unknown' });
              gtag('event', 'form_submission', { formId: form.id || 'unknown' });
            });
          });
          // Page View
          mixpanel.track('Page View', { page: window.location.pathname });
          gtag('event', 'page_view', { page_path: window.location.pathname });
          // Video Play
          document.querySelectorAll('video, iframe[src*="youtube"]').forEach(video => {
            video.addEventListener('play', () => {
              mixpanel.track('Video Play', { video: video.src });
              gtag('event', 'video_play', { video: video.src });
            });
          });
          // App Download
          document.querySelectorAll('a[href*="app"]').forEach(link => {
            link.addEventListener('click', () => {
              mixpanel.track('App Download', { link: link.href });
              gtag('event', 'app_download', { link: link.href });
            });
          });
          // Purchase
          window.addEventListener('purchase', (e) => {
            mixpanel.track('Purchase', e.detail);
            gtag('event', 'purchase', e.detail);
          });
          // Subscription
          window.addEventListener('subscription', (e) => {
            mixpanel.track('Subscription', e.detail);
            gtag('event', 'subscription', e.detail);
          });
        `}
      </Script>
      <Header />
      <main className="container mx-auto px-4 py-8 min-h-screen bg-white text-black gradient-bg">
        <Component {...pageProps} />
      </main>
      <Footer />
    </Provider>
  );
}

export default MyApp;