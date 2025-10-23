// pages/dashboard.js
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return '—';
  }
}

function formatCurrency(n) {
  if (typeof n !== 'number') return n ?? '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [affiliate, setAffiliate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // Authenticated user
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/login');
          return;
        }
        if (!isMounted) return;
        setUser(authUser);

        // Role check
        const { data: userRow, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .maybeSingle();

        if (roleError) {
          if (!isMounted) return;
          setError('Failed to load user role. Please try again.');
          setLoading(false);
          return;
        }
        if (!userRow) {
          if (!isMounted) return;
          setError('User data not found. Contact support.');
          setLoading(false);
          return;
        }
        if (userRow.role === 'admin') {
          router.push('/admin');
          return;
        }

        // Parallel fetches
        const [o, s, a] = await Promise.all([
          supabase
            .from('orders')
            .select('*')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false }),
          supabase.from('affiliates').select('*').eq('user_id', authUser.id).maybeSingle(),
        ]);

        if (!isMounted) return;

        if (o.error || s.error || a.error) {
          setError('Failed to load some dashboard data. Please try again.');
        }

        setOrders(o.data || []);
        setSubscriptions(s.data || []);
        setAffiliate(a.data || null);
        setLoading(false);
      } catch {
        if (!isMounted) return;
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <>
      <Head>
        <title>Manyagi User Dashboard</title>
      </Head>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold">User Dashboard</h1>

        {/* Orders */}
        <section>
          <h2 className="text-xl font-bold mb-2">Your Orders</h2>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-left">Order ID</th>
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-left">Total</th>
                    <th className="border p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="border p-2">{order.id}</td>
                      <td className="border p-2">{formatDate(order.created_at)}</td>
                      <td className="border p-2">{formatCurrency(order.total_amount)}</td>
                      <td className="border p-2 capitalize">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Subscriptions */}
        <section>
          <h2 className="text-xl font-bold mb-2">Your Subscriptions</h2>
          {subscriptions.length === 0 ? (
            <p>No subscriptions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-left">Subscription ID</th>
                    <th className="border p-2 text-left">Start Date</th>
                    <th className="border p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td className="border p-2">{sub.id}</td>
                      <td className="border p-2">{formatDate(sub.created_at)}</td>
                      <td className="border p-2 capitalize">{sub.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Affiliate */}
        <section>
          <h2 className="text-xl font-bold mb-2">Your Affiliate Info</h2>
          {affiliate ? (
            <div className="rounded border p-3">
              <p>
                <span className="font-semibold">Referral Code:</span>{' '}
                <span className="font-mono">{affiliate.referral_code}</span>
              </p>
            </div>
          ) : (
            <p>No affiliate account. Contact support to join.</p>
          )}
        </section>

        <button
          onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
          className="p-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>
    </>
  );
}
