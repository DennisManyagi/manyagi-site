import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [affiliate, setAffiliate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: userRow } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
      if (userRow?.role === 'admin') {
        router.push('/admin');
        return;
      }

      const [o, s, a] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('affiliates').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      setOrders(o.data || []);
      setSubscriptions(s.data || []);
      setAffiliate(a.data);
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <>
      <Head>
        <title>Manyagi User Dashboard</title>
      </Head>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <section>
          <h2 className="text-xl font-bold mb-2">Your Orders</h2>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Order ID</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="border p-2">{order.id}</td>
                    <td className="border p-2">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="border p-2">${order.total_amount}</td>
                    <td className="border p-2">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2">Your Subscriptions</h2>
          {subscriptions.length === 0 ? (
            <p>No subscriptions yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Subscription ID</th>
                  <th className="border p-2">Start Date</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="border p-2">{sub.id}</td>
                    <td className="border p-2">{new Date(sub.created_at).toLocaleDateString()}</td>
                    <td className="border p-2">{sub.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2">Your Affiliate Info</h2>
          {affiliate ? (
            <p>Referral Code: {affiliate.referral_code}</p>
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