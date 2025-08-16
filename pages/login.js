import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import Hero from '../components/Hero';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn('credentials', { username, password, redirect: false });
  };

  return (
    <>
      <Head>
        <title>Login - Manyagi</title>
      </Head>
      <Hero title="Login" lead="Access your account for personalized features." />
      <form onSubmit={handleSubmit} className="card max-w-md mx-auto">
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full mb-4 p-3 border border-line rounded" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full mb-4 p-3 border border-line rounded" />
        <button type="submit" className="btn w-full mb-4">Login</button>
        <button type="button" onClick={() => signIn('google')} className="btn ghost w-full">Login with Google</button>
      </form>
    </>
  );
}