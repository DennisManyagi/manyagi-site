import { AuthProvider } from '@/contexts/AuthContext';
import { Provider } from 'react-redux';
import { store } from '@/store'; // We'll create this next
import { HelmetProvider } from 'react-helmet-async';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default MyApp;