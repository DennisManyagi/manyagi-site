// pages/r/[code].js
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AffiliateRedirect() {
  const router = useRouter();
  const { code } = router.query;

  useEffect(() => {
    if (!code) return;
    try {
      // Store cookie for 30 days
      document.cookie = `affiliate=${encodeURIComponent(
        code
      )}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

      // Redirect user after short delay (optional)
      setTimeout(() => {
        router.replace('/'); // or /capital, /tech, etc.
      }, 500);
    } catch (err) {
      console.error('Affiliate redirect error:', err);
    }
  }, [code]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <h1 className="text-2xl font-bold mb-2">
        Thanks for supporting our partners!
      </h1>
      <p className="opacity-80">
        Redirecting you to Manyagi HQ…
      </p>
    </div>
  );
}
