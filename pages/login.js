import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Hero from '../components/Hero';  // Add Hero for background

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let data, authError;
      if (isSignup) {
        ({ data, error: authError } = await supabase.auth.signUp({ email, password }));
        if (authError) throw authError;
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        ({ data, error: authError } = await supabase.auth.signInWithPassword({ email, password }));
        if (authError) throw authError;
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>{isSignup ? 'Sign Up' : 'Login'} - Manyagi</title>
      </Head>
      <Hero
        kicker={isSignup ? "Join Us" : "Welcome Back"}
        title={isSignup ? "Sign Up" : "Login"}
        lead={isSignup ? "Create your Manyagi account." : "Access your dashboard."}
        carouselImages={[]}  // Optional, or add images
        height="h-screen"  // Full screen for login
      >
        <div className="card max-w-md mx-auto bg-white text-black glass p-8 rounded-lg shadow-xl">
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded bg-white text-black"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded bg-white text-black"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-black text-white rounded disabled:opacity-50 hover:bg-gray-800 transition"
            >
              {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
            </button>
          </form>
          <button
            onClick={handleGoogleLogin}
            className="mt-4 w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            {isSignup ? 'Sign Up' : 'Login'} with Google
          </button>
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="mt-4 text-blue-500 underline w-full text-center"
          >
            {isSignup ? 'Switch to Login' : 'Switch to Sign Up'}
          </button>
        </div>
      </Hero>
    </>
  );
}