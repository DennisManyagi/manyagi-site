import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

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
      let data, authError; // Fixed: Declare without destructuring
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">{isSignup ? 'Sign Up' : 'Login'}</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleAuth} className="space-y-4 max-w-md">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-black text-white rounded disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className="mt-4 p-2 bg-blue-500 text-white rounded w-full max-w-md"
        >
          Login with Google
        </button>
        <button
          onClick={() => setIsSignup(!isSignup)}
          className="mt-4 text-blue-500 underline"
        >
          {isSignup ? 'Switch to Login' : 'Switch to Sign Up'}
        </button>
      </div>
    </>
  );
}