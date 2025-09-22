import { AuthProvider } from '@/contexts/AuthContext';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/index';
import Auth from '@/pages/auth';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <HelmetProvider>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <AuthProvider>
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home {...pageProps} />} />
              <Route path="/auth" element={<Auth {...pageProps} />} />
            </Routes>
          </BrowserRouter>
        </Provider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default MyApp;