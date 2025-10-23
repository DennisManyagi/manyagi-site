// pages/admin.js
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import EventCalendar from '@/components/Calendar';
import SEO from '@/components/SEO';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';

// Import extracted components
import MultiUploader from '@/components/admin/MultiUploader';
import QuickProductForm from '@/components/admin/QuickProductForm';
import PublishingProductForm from '@/components/admin/PublishingProductForm';
import CapitalProductForm from '@/components/admin/CapitalProductForm';
import TechShowcaseForm from '@/components/admin/TechShowcaseForm';
import MediaShowcaseForm from '@/components/admin/MediaShowcaseForm';
import AffiliatesForm from '@/components/admin/AffiliatesForm';
import BundlesForm from '@/components/admin/BundlesForm';
import AttachToProperty from '@/components/admin/AttachToProperty';
import PropertyRatesPanel from '@/components/admin/PropertyRatesPanel';
import RealtyTestEmailPanelWithProperty from '@/components/admin/RealtyTestEmailPanelWithProperty';
import PropertyForm from '@/components/admin/PropertyForm';

// Lazy-load MDX for admin speed
const MDXRemote = dynamic(() => import('next-mdx-remote').then((m) => m.MDXRemote), {
  ssr: false,
});
const mdxSerialize = async (content) =>
  (await import('next-mdx-remote/serialize')).serialize(content || '');

// Utility Functions (keep small ones here or move to lib/adminUtils.js if they grow)
const toArrayTags = (s) =>
  Array.from(
    new Set(
      String(s || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );

const tagsToCSV = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');
const safeJSON = (s, fallback = {}) => {
  try {
    if (!s) return fallback;
    if (typeof s === 'object') return s;
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};
const copyText = async (txt) => {
  try {
    await navigator.clipboard.writeText(txt);
    alert('Copied!');
  } catch {}
};
const currency = (n) => `$${Number(n || 0).toFixed(2)}`;
const isWithinLastDays = (iso, days = 30) => {
  if (!iso) return false;
  const d = new Date(iso);
  const since = new Date();
  since.setDate(since.getDate() - days);
  return d >= since;
};

// UI Components (small ones stay here)
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded transition ${
      active ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'
    }`}
  >
    {children}
  </button>
);

const SectionCard = ({ title, children, className = '' }) => (
  <section className={`glass p-6 rounded ${className}`}>
    {title ? <h2 className="text-2xl font-bold mb-4">{title}</h2> : null}
    {children}
  </section>
);

// Main Admin Component
function Admin() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [siteConfig, setSiteConfig] = useState({});
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState({
    id: null,
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft',
    division: 'site',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [mdx, setMdx] = useState(null);
  const [postFilter, setPostFilter] = useState('all');
  const [postQuery, setPostQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [productEdits, setProductEdits] = useState({});
  const [assetEdits, setAssetEdits] = useState({});

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: userRow } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (userRow?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setIsAdmin(true);

      await refreshAll();
      setLoading(false);
    })();
  }, [router]);

  const refreshAll = async () => {
    const [p, o, s, a, c, b, u, prop, aff, bund, ev] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase.from('assets').select('*').order('created_at', { ascending: false }),
      supabase.from('site_config').select('*'),
      supabase.from('posts').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('*').order('created_at', { ascending: false }),
      supabase.from('affiliates').select('*').order('created_at', { ascending: false }),
      supabase.from('bundles').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('created_at', { ascending: false }),
    ]);

    setProducts(p.data || []);
    setOrders(o.data || []);
    setSubscriptions(s.data || []);
    setAssets(a.data || []);
    setSiteConfig((c.data || []).reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}));
    setPosts(b.data || []);
    setUsers(u.data || []);
    setProperties(prop.data || []);
    setAffiliates(aff.data || []);
    setBundles(bund.data || []);
    setEvents(ev.data || []);
  };

  const saveProductRow = async (p) => {
    try {
      const edits = productEdits[p.id] || {};
      if (!Object.keys(edits).length) return;

      const nextMeta = {
        ...(p.metadata || {}),
        ...(edits.metadata ? safeJSON(edits.metadata, p.metadata || {}) : {}),
      };

      const payload = {
        ...('thumbnail_url' in edits ? { thumbnail_url: edits.thumbnail_url } : {}),
        ...('display_image' in edits ? { display_image: edits.display_image } : {}),
        ...('printful_product_id' in edits
          ? { printful_product_id: edits.printful_product_id }
          : {}),
        ...('price' in edits ? { price: parseFloat(edits.price || 0) } : {}),
        ...('description' in edits ? { description: edits.description } : {}),
        ...('tagsStr' in edits ? { tags: toArrayTags(edits.tagsStr) } : {}),
        ...(edits.metadata ? { metadata: nextMeta } : {}),
      };

      const { error } = await supabase.from('products').update(payload).eq('id', p.id);
      if (error) throw error;

      setProductEdits((prev) => ({ ...prev, [p.id]: {} }));
      await refreshAll();
      alert('Saved.');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert(`Delete failed: ${error.message}`);
    else {
      await refreshAll();
      alert('Product deleted.');
    }
  };

  const saveAssetRow = async (a) => {
    try {
      const edits = assetEdits[a.id] || {};
      if (!Object.keys(edits).length) return;

      const payload = {
        ...('filename' in edits ? { filename: edits.filename } : {}),
        ...('division' in edits ? { division: edits.division } : {}),
        ...('purpose' in edits ? { purpose: edits.purpose } : {}),
        ...('tagsStr' in edits ? { tags: toArrayTags(edits.tagsStr) } : {}),
        ...('metadataStr' in edits ? { metadata: safeJSON(edits.metadataStr, a.metadata || {}) } : {}),
      };

      const { error } = await supabase.from('assets').update(payload).eq('id', a.id);
      if (error) throw error;

      setAssetEdits((prev) => ({ ...prev, [a.id]: {} }));
      await refreshAll();
      alert('Asset saved.');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  };

  const loadPostToForm = (p) => {
    setPostForm({
      id: p.id,
      title: p.title || '',
      slug: p.slug || '',
      excerpt: p.excerpt || '',
      content: p.content || '',
      featured_image: p.featured_image || '',
      status: p.status || 'draft',
      division: p.division || 'site',
    });
    setShowPreview(false);
    setMdx(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearPostForm = () =>
    setPostForm({
      id: null,
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      status: 'draft',
      division: 'site',
    });

  const savePost = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: postForm.title,
        slug: postForm.slug,
        excerpt: postForm.excerpt,
        content: postForm.content,
        featured_image: postForm.featured_image,
        status: postForm.status,
        division: postForm.division || 'site',
        author_id: user.id,
      };
      if (postForm.id) {
        const { error } = await supabase.from('posts').update(payload).eq('id', postForm.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert(payload);
        if (error) throw error;
      }
      clearPostForm();
      await refreshAll();
      alert('Saved post.');
    } catch (err) {
      alert(`Failed to save post: ${err.message}`);
    }
  };

  const publishToggle = async (id, nextStatus) => {
    const { error } = await supabase.from('posts').update({ status: nextStatus }).eq('id', id);
    if (error) alert(error.message);
    else refreshAll();
  };

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) alert(error.message);
    else {
      if (postForm.id === id) clearPostForm();
      refreshAll();
    }
  };

  const doPreview = async () => {
    try {
      const ser = await mdxSerialize(postForm.content || '');
      setMdx(ser);
      setShowPreview(true);
    } catch (err) {
      alert(`MDX parse error: ${err.message}`);
    }
  };

  const kpis = useMemo(() => {
    const last30Orders = orders.filter((o) => isWithinLastDays(o.created_at, 30));
    const revenueL30 = last30Orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const ordersL30 = last30Orders.length;
    const subsActive = subscriptions.filter(
      (s) => (s.status || '').toLowerCase() === 'active'
    ).length;
    return { revenueL30, ordersL30, subsActive, users: users.length };
  }, [orders, subscriptions, users]);

  const revenueByDivision = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (!isWithinLastDays(o.created_at, 30)) return;
      const d = (o.division || 'site').toLowerCase();
      map[d] = (map[d] || 0) + Number(o.total_amount || 0);
    });
    return Object.entries(map).map(([division, total]) => ({ division, total }));
  }, [orders]);

  // NEW: User growth data (example; in real, aggregate users.created_at)
  const userGrowth = useMemo(() => {
    const growth = users.reduce((acc, u) => {
      const month = new Date(u.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(growth).map(([month, count]) => ({ month, count })).sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [users]);

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role to ${newRole} for this user?`)) return;
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (error) alert(`Failed to update role: ${error.message}`);
    else await refreshAll();
  };

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) alert(`Delete failed: ${error.message}`);
    else await refreshAll();
  };

  if (loading) return <p className="p-6">Loading admin dashboard…</p>;
  if (!isAdmin) return <p className="p-6">Not authorized.</p>;

  const filteredPosts = posts
    .filter((p) =>
      postFilter === 'all'
        ? true
        : (p.status || 'draft') === (postFilter === 'draft' ? 'draft' : 'published')
    )
    .filter((p) =>
      !postQuery
        ? true
        : (p.title || '').toLowerCase().includes(postQuery.toLowerCase()) ||
          (p.slug || '').toLowerCase().includes(postQuery.toLowerCase())
    );

  return (
    <>
      <Head>
        <title>Manyagi Admin Dashboard</title>
      </Head>
      <div className="container mx-auto px-4 py-8 space-y-12 gradient-bg dark:bg-gray-900">
        <nav className="flex gap-2 mb-6 flex-wrap">
          {[
            'overview',
            'publishing',
            'designs',
            'capital',
            'tech',
            'media',
            'realty',
            'assets',
            'blog',
            'affiliates',
            'bundles',
            'users',
            'analytics',
            'events',
          ].map((tab) => (
            <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabButton>
          ))}
        </nav>

        {activeTab === 'overview' && (
          <>
            <SectionCard title="Key Metrics (Last 30 Days)">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="text-sm opacity-70">Revenue</div>
                  <div className="text-2xl font-bold">{currency(kpis.revenueL30)}</div>
                </div>
                <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="text-sm opacity-70">Orders</div>
                  <div className="text-2xl font-bold">{kpis.ordersL30}</div>
                </div>
                <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="text-sm opacity-70">Active Subs</div>
                  <div className="text-2xl font-bold">{kpis.subsActive}</div>
                </div>
                <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="text-sm opacity-70">Users</div>
                  <div className="text-2xl font-bold">{kpis.users}</div>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Revenue by Division (Last 30 Days)">
              {revenueByDivision.length === 0 ? (
                <p className="opacity-70">No orders in the last 30 days.</p>
              ) : (
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByDivision}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="division" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>
          </>
        )}

        {activeTab === 'publishing' && (
          <SectionCard title="Publishing Division">
            <PublishingProductForm onCreated={refreshAll} />
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Books</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left border-b dark:border-gray-700">
                      <th className="py-2">Cover</th>
                      <th>Title</th>
                      <th>Display Image</th>
                      <th>Price</th>
                      <th>Tags</th>
                      <th>Description</th>
                      <th>Metadata (Amazon/PDF/etc.)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p) => p.division === 'publishing')
                      .map((p) => {
                        const row = productEdits[p.id] || {};
                        const prettyMeta = JSON.stringify(p.metadata || {}, null, 0);
                        return (
                          <tr key={p.id} className="border-b dark:border-gray-800 align-top">
                            <td className="py-2">
                              {(p.thumbnail_url || p.display_image) ? (
                                <img
                                  src={p.thumbnail_url || p.display_image}
                                  className="w-14 h-14 object-cover rounded"
                                />
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-2">{p.name}</td>
                            <td className="py-2 min-w-[220px]">
                              <input
                                className="w-full dark:bg-gray-800"
                                placeholder="display_image / thumbnail_url"
                                value={
                                  row.display_image ?? (p.display_image || p.thumbnail_url || '')
                                }
                                onChange={(e) =>
                                  setProductEdits((prev) => ({
                                    ...prev,
                                    [p.id]: {
                                      ...row,
                                      display_image: e.target.value,
                                      thumbnail_url: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </td>
                            <td className="py-2 min-w-[100px]">
                              <input
                                type="number"
                                className="w-full dark:bg-gray-800"
                                placeholder={String(p.price ?? '')}
                                value={row.price ?? (p.price ?? '')}
                                onChange={(e) =>
                                  setProductEdits((prev) => ({
                                    ...prev,
                                    [p.id]: { ...row, price: e.target.value },
                                  }))
                                }
                              />
                            </td>
                            <td className="py-2 min-w-[200px]">
                              <input
                                className="w-full dark:bg-gray-800"
                                placeholder="comma,separated,tags"
                                value={row.tagsStr ?? tagsToCSV(p.tags)}
                                onChange={(e) =>
                                  setProductEdits((prev) => ({
                                    ...prev,
                                    [p.id]: { ...row, tagsStr: e.target.value },
                                  }))
                                }
                              />
                            </td>
                            <td className="py-2 min-w-[300px]">
                              <textarea
                                className="w-full h-24 dark:bg-gray-800"
                                value={row.description ?? (p.description || '')}
                                onChange={(e) =>
                                  setProductEdits((prev) => ({
                                    ...prev,
                                    [p.id]: { ...row, description: e.target.value },
                                  }))
                                }
                              />
                            </td>
                            <td className="py-2 min-w-[360px]">
                              <textarea
                                className="w-full h-24 dark:bg-gray-800"
                                placeholder='{"amazon_url":"…","paperback_url":"…","kindle_url":"…","hardcover_url":"…","pdf_url":"…","format":"ebook","year":2025,"primary_store":"amazon"}'
                                value={row.metadata ?? prettyMeta}
                                onChange={(e) =>
                                  setProductEdits((prev) => ({
                                    ...prev,
                                    [p.id]: { ...row, metadata: e.target.value },
                                  }))
                                }
                              />
                            </td>
                            <td className="py-2 space-x-2">
                              <button
                                className="px-3 py-1 bg-blue-600 text-white rounded"
                                onClick={() => saveProductRow(p)}
                              >
                                Save
                              </button>
                              <button
                                className="px-3 py-1 bg-red-600 text-white rounded"
                                onClick={() => deleteProduct(p.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {products.filter((p) => p.division === 'publishing').length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-6 opacity-70">
                          No books yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>
        )}

        {activeTab === 'designs' && (
          <SectionCard title="Designs Division">
            <QuickProductForm defaultDivision="designs" onCreated={refreshAll} />
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Products (Designs)</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="py-2">Thumb</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Printful ID</th>
                    <th>thumbnail_url</th>
                    <th>tags</th>
                    <th>description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter((p) => p.division === 'designs')
                    .map((p) => {
                      const row = productEdits[p.id] || {};
                      return (
                        <tr key={p.id} className="border-b dark:border-gray-800 align-top">
                          <td className="py-2">
                            {p.thumbnail_url ? (
                              <img
                                src={p.thumbnail_url}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : null}
                          </td>
                          <td className="py-2">{p.name}</td>
                          <td className="py-2 min-w-[100px]">
                            <input
                              type="number"
                              className="w-full dark:bg-gray-800"
                              value={row.price ?? (p.price ?? '')}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...row, price: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 min-w-[160px]">
                            <input
                              className="w-full dark:bg-gray-800"
                              placeholder="printful_product_id"
                              value={row.printful_product_id ?? (p.printful_product_id || '')}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...row, printful_product_id: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 min-w-[220px]">
                            <input
                              className="w-full dark:bg-gray-800"
                              placeholder="thumbnail_url"
                              value={row.thumbnail_url ?? (p.thumbnail_url || '')}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...row, thumbnail_url: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 min-w-[200px]">
                            <input
                              className="w-full dark:bg-gray-800"
                              placeholder="comma,separated,tags"
                              value={row.tagsStr ?? tagsToCSV(p.tags)}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...row, tagsStr: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 min-w-[220px]">
                            <textarea
                              className="w-full h-16 dark:bg-gray-800"
                              placeholder="description"
                              value={row.description ?? (p.description || '')}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...row, description: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 space-x-2">
                            <button
                              className="px-3 py-1 bg-blue-600 text-white rounded"
                              onClick={() => saveProductRow(p)}
                            >
                              Save
                            </button>
                            <button
                              className="px-3 py-1 bg-red-600 text-white rounded"
                              onClick={() => deleteProduct(p.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {products.filter((p) => p.division === 'designs').length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 opacity-70">
                        No products yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === 'capital' && (
          <SectionCard title="Capital Division">
            <CapitalProductForm onCreated={refreshAll} />
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Products (Capital)</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="py-2">Thumb</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Thumbnail URL</th>
                    <th>Tags</th>
                    <th>Description</th>
                    <th>Metadata JSON</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter((p) => p.division === 'capital')
                    .map((p) => {
                      const row = productEdits[p.id] || {};
                      return (
                        <tr key={p.id} className="border-b dark:border-gray-800 align-top">
                          <td className="py-2">
                            {p.thumbnail_url ? (
                              <img
                                src={p.thumbnail_url}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : null}
                          </td>
                          <td className="py-2">{p.name}</td>
                          <td className="py-2 min-w-[100px]">
                            <input
                              type="number"
                              className="w-full dark:bg-gray-800"
                              value={row.price ?? (p.price ?? '')}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...row, price: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 min-w-[220px]">
                            <input
                              className="w-full dark:bg-gray-800"
                              placeholder="thumbnail_url"
                              value={row.thumbnail_url ?? (p.thumbnail_url || '')}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...row, thumbnail_url: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 min-w-[200px]">
                            <input
                              className="w-full dark:bg-gray-800"
                              placeholder="comma,separated,tags"
                              value={row.tagsStr ?? tagsToCSV(p.tags)}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...row, tagsStr: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 min-w-[300px]">
                            <textarea
                              className="w-full h-20 dark:bg-gray-800"
                              placeholder="description"
                              value={row.description ?? (p.description || '')}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...row, description: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 min-w-[300px]">
                            <textarea
                              className="w-full h-20 dark:bg-gray-800"
                              placeholder='{"license_type":"bot","api_access":false}'
                              value={row.metadata ?? JSON.stringify(p.metadata || {}, null, 0)}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...row, metadata: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 space-x-2">
                            <button
                              className="px-3 py-1 bg-blue-600 text-white rounded"
                              onClick={() => saveProductRow(p)}
                            >
                              Save
                            </button>
                            <button
                              className="px-3 py-1 bg-red-600 text-white rounded"
                              onClick={() => deleteProduct(p.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {products.filter((p) => p.division === 'capital').length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 opacity-70">
                        No products yet.
                      </td>
                    </tr>
                 )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === 'tech' && (
          <SectionCard title="Tech Division">
            <TechShowcaseForm onCreated={refreshAll} />
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Showcase Items (Tech)</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="py-2">Title</th>
                    <th>Slug</th>
                    <th>Image</th>
                    <th>Metadata</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts
                    .filter((p) => p.division === 'tech')
                    .map((p) => (
                      <tr key={p.id} className="border-b dark:border-gray-800 align-top">
                        <td className="py-2">{p.title}</td>
                        <td className="py-2">{p.slug}</td>
                        <td className="py-2">
                          {p.featured_image ? (
                            <img
                              src={p.featured_image}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2 min-w-[200px]">
                          <textarea
                            className="w-full h-16 dark:bg-gray-800"
                            value={JSON.stringify(p.metadata || {}, null, 0)}
                            readOnly
                          />
                        </td>
                        <td className="py-2 space-x-2">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                            onClick={() => loadPostToForm(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 bg-red-600 text-white rounded"
                            onClick={() => deletePost(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  {posts.filter((p) => p.division === 'tech').length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 opacity-70">
                        No showcase items yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === 'media' && (
          <SectionCard title="Media Division">
            <MediaShowcaseForm onCreated={refreshAll} />
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Showcase Items (Media)</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="py-2">Title</th>
                    <th>Slug</th>
                    <th>Image</th>
                    <th>Metadata</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts
                    .filter((p) => p.division === 'media')
                    .map((p) => (
                      <tr key={p.id} className="border-b dark:border-gray-800 align-top">
                        <td className="py-2">{p.title}</td>
                        <td className="py-2">{p.slug}</td>
                        <td className="py-2">
                          {p.featured_image ? (
                            <img
                              src={p.featured_image}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2 min-w-[200px]">
                          <textarea
                            className="w-full h-16 dark:bg-gray-800"
                            value={JSON.stringify(p.metadata || {}, null, 0)}
                            readOnly
                          />
                        </td>
                        <td className="py-2 space-x-2">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                            onClick={() => loadPostToForm(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 bg-red-600 text-white rounded"
                            onClick={() => deletePost(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  {posts.filter((p) => p.division === 'media').length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 opacity-70">
                        No showcase items yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === 'realty' && (
          <div className="mt-8 glass p-6 rounded">
            <h3 className="text-xl font-bold mb-2">Realty Gallery Uploader</h3>
            <p className="text-sm opacity-80 mb-4">
              Upload multiple images to storage under <code>assets/realty/&lt;purpose&gt;/YYYY/MM</code>.
              Then attach them to a property.
            </p>

            <MultiUploader
              division="realty"
              purpose="gallery"
              onUploaded={refreshAll}
            />

            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold mb-2">Attach uploaded URLs to a property</h4>
              <AttachToProperty properties={properties} onAfter={refreshAll} />
            </div>

            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold mb-2">Manage Seasonal Rates for a Property</h4>
              <PropertyRatesPanel properties={properties.filter(p => p.division === 'realty')} />
            </div>

            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold mb-2">Send Test Itinerary Email</h4>
              <RealtyTestEmailPanelWithProperty />
            </div>

            {/* NEW: Property Creation Form */}
            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold mb-2">Create New Property</h4>
              <PropertyForm onCreated={refreshAll} />
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <SectionCard title="Assets Library">
            <p className="text-sm opacity-80 mb-3">
              Upload once, reuse anywhere. Choose division + purpose to route files into
              structured folders in your Supabase Storage (e.g. <code>designs/hero</code>).
            </p>
            <MultiUploader division="site" purpose="general" fileType="image" onUploaded={refreshAll} />
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="py-2">Preview</th>
                    <th>Filename</th>
                    <th>Division</th>
                    <th>Purpose</th>
                    <th>Tags</th>
                    <th>Metadata (JSON)</th>
                    <th>URL</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.slice(0, 50).map((a) => {
                    const row = assetEdits[a.id] || {};
                    return (
                      <tr key={a.id} className="align-top border-b dark:border-gray-800">
                        <td className="py-2">
                          {a.file_type === 'image' ? (
                            <img src={a.file_url} className="w-12 h-12 object-cover rounded" />
                          ) : a.file_type === 'video' ? (
                            '🎞️'
                          ) : (
                            '📄'
                          )}
                        </td>
                        <td className="py-2 min-w-[160px]">
                          <input
                            className="w-full dark:bg-gray-800"
                            placeholder={a.filename || '-'}
                            value={row.filename ?? (a.filename || '')}
                            onChange={(e) =>
                              setAssetEdits((prev) => ({
                                ...prev,
                                [a.id]: { ...row, filename: e.target.value },
                              }))
                            }
                          />
                        </td>
                        <td className="py-2">
                          <select
                            className="dark:bg-gray-800"
                            value={row.division ?? (a.division || 'site')}
                            onChange={(e) =>
                              setAssetEdits((prev) => ({
                                ...prev,
                                [a.id]: { ...row, division: e.target.value },
                              }))
                            }
                          >
                            {['site', 'publishing', 'designs', 'capital', 'tech', 'media', 'realty'].map(
                              (d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                        <td className="py-2">
                          <select
                            className="dark:bg-gray-800"
                            value={row.purpose ?? (a.purpose || 'general')}
                            onChange={(e) =>
                              setAssetEdits((prev) => ({
                                ...prev,
                                [a.id]: { ...row, purpose: e.target.value },
                              }))
                            }
                          >
                            <option value="general">general</option>
                            <option value="hero">hero</option>
                            <option value="carousel">carousel</option>
                          </select>
                        </td>
                        <td className="py-2 min-w-[200px]">
                          <input
                            className="w-full dark:bg-gray-800"
                            placeholder="comma,separated,tags"
                            value={row.tagsStr ?? tagsToCSV(a.tags)}
                            onChange={(e) =>
                              setAssetEdits((prev) => ({
                                ...prev,
                                [a.id]: { ...row, tagsStr: e.target.value },
                              }))
                            }
                          />
                        </td>
                        <td className="py-2 min-w-[260px]">
                          <textarea
                            className="w-full h-16 dark:bg-gray-800"
                            placeholder='{"scene":"exile-portal"}'
                            value={row.metadataStr ?? JSON.stringify(a.metadata || {}, null, 0)}
                            onChange={(e) =>
                              setAssetEdits((prev) => ({
                                ...prev,
                                [a.id]: { ...row, metadataStr: e.target.value },
                              }))
                            }
                          />
                        </td>
                        <td className="py-2 max-w-[280px] truncate">{a.file_url}</td>
                        <td className="py-2 space-x-2">
                          <button
                            className="text-blue-600"
                            type="button"
                            onClick={() => copyText(a.file_url)}
                          >
                            Copy URL
                          </button>
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                            type="button"
                            onClick={() => saveAssetRow(a)}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {assets.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 opacity-70">
                        No assets yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === 'blog' && (
          <SectionCard title="Blog">
            <SEO
              title="Manyagi Admin - Blog Management"
              description="Manage blog posts for Manyagi divisions."
            />
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <select
                value={postFilter}
                onChange={(e) => setPostFilter(e.target.value)}
                className="p-2 rounded border dark:bg-gray-800"
              >
                <option value="all">All</option>
                <option value="draft">Drafts</option>
                <option value="published">Published</option>
              </select>
              <input
                placeholder="Search title or slug…"
                value={postQuery}
                onChange={(e) => setPostQuery(e.target.value)}
                className="p-2 rounded border flex-1 dark:bg-gray-800"
              />
            </div>
            <form
              onSubmit={savePost}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800"
            >
              <input
                placeholder="Title"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              />
              <input
                placeholder="Slug"
                value={postForm.slug}
                onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
              />
              <input
                className="col-span-2"
                placeholder="Excerpt"
                value={postForm.excerpt}
                onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
              />
              <input
                className="col-span-2"
                placeholder="Featured Image URL"
                value={postForm.featured_image}
                onChange={(e) => setPostForm({ ...postForm, featured_image: e.target.value })}
              />
              <select
                value={postForm.division}
                onChange={(e) => setPostForm({ ...postForm, division: e.target.value })}
              >
                {['site', 'publishing', 'designs', 'capital', 'tech', 'media', 'realty'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={postForm.status}
                onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <textarea
                className="col-span-2 h-32"
                placeholder="Content (MDX)"
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
              />
              <div className="flex gap-2">
                <button className="p-2 bg-black text-white rounded dark:bg-gray-700">
                  Save Post
                </button>
                <button
                  type="button"
                  onClick={doPreview}
                  className="p-2 bg-gray-500 text-white rounded"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostForm({
                      id: null,
                      title: '',
                      slug: '',
                      excerpt: '',
                      content: '',
                      featured_image: '',
                      status: 'draft',
                      division: 'site',
                    });
                    setShowPreview(false);
                    setMdx(null);
                  }}
                  className="p-2 bg-red-500 text-white rounded"
                >
                  Clear
                </button>
              </div>
            </form>
            {showPreview && mdx && (
              <SectionCard>
                <MDXRemote {...mdx} />
              </SectionCard>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Slug</th>
                  <th className="text-left py-2">Division</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((p) => (
                  <tr key={p.id} className="border-t dark:border-gray-800">
                    <td className="py-2">{p.title}</td>
                    <td className="py-2">{p.slug}</td>
                    <td className="py-2">{p.division || 'site'}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          (p.status || 'draft') === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {p.status || 'draft'}
                      </span>
                    </td>
                    <td className="py-2 space-x-2">
                      <button
                        onClick={() => loadPostToForm(p)}
                        className="text-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          publishToggle(
                            p.id,
                            (p.status || 'draft') === 'published' ? 'draft' : 'published'
                          )
                        }
                        className="text-green-600"
                      >
                        {(p.status || 'draft') === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => deletePost(p.id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPosts.length === 0 && (
                  <tr>
                    <td className="py-6 opacity-70" colSpan={5}>
                      No posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </SectionCard>
        )}

        {activeTab === 'affiliates' && (
          <SectionCard title="Affiliates Division">
            <AffiliatesForm onCreated={refreshAll} />
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Affiliates</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="py-2">Name</th>
                    <th>Referral Code</th>
                    <th>Commission Rate</th>
                    <th>Metadata</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map((aff) => (
                    <tr key={aff.id} className="border-b dark:border-gray-800 align-top">
                      <td className="py-2">{aff.name}</td>
                      <td className="py-2">{aff.referral_code}</td>
                      <td className="py-2">{aff.commission_rate * 100}%</td>
                      <td className="py-2 min-w-[200px]">
                        <textarea
                          className="w-full h-16 dark:bg-gray-800"
                          value={JSON.stringify(aff.metadata || {}, null, 0)}
                          readOnly
                        />
                      </td>
                      <td className="py-2">
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded"
                          onClick={async () => {
                            if (!confirm('Delete this affiliate?')) return;
                            const { error } = await supabase.from('affiliates').delete().eq('id', aff.id);
                            if (error) alert(`Delete failed: ${error.message}`);
                            else await refreshAll();
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {affiliates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 opacity-70">
                        No affiliates yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === 'bundles' && (
          <SectionCard title="Bundles Division">
            <BundlesForm products={products} onCreated={refreshAll} />
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Bundles</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="py-2">Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Products</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bundles.map((bund) => (
                    <tr key={bund.id} className="border-b dark:border-gray-800 align-top">
                      <td className="py-2">{bund.name}</td>
                      <td className="py-2">{bund.description || '—'}</td>
                      <td className="py-2">{currency(bund.price)}</td>
                      <td className="py-2">{bund.product_ids.length} products</td>
                      <td className="py-2">
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded"
                          onClick={async () => {
                            if (!confirm('Delete this bundle?')) return;
                            const { error } = await supabase.from('bundles').delete().eq('id', bund.id);
                            if (error) alert(`Delete failed: ${error.message}`);
                            else await refreshAll();
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bundles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 opacity-70">
                        No bundles yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === 'users' && (
          <SectionCard title="Users Management">
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="py-2">Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b dark:border-gray-800">
                      <td className="py-2">{u.email}</td>
                      <td className="py-2">{u.role || 'user'}</td>
                      <td className="py-2">{new Date(u.created_at).toLocaleString()}</td>
                      <td className="py-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded"
                          onClick={() => toggleUserRole(u.id, u.role)}
                        >
                          Toggle Role
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 opacity-70">
                        No users yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === 'analytics' && (
          <SectionCard title="Analytics Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Revenue by Division</h3>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByDivision}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="division" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* NEW: User Growth Chart */}
              <div>
                <h3 className="font-semibold mb-3">User Growth</h3>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {activeTab === 'events' && (
          <SectionCard title="Events Management">
            {/* Simple form to add events */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <input
                placeholder="Event Title"
                value={postForm.title} // Reusing postForm for simplicity, but ideally separate state
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              />
              <input
                type="datetime-local"
                placeholder="Start Date"
                onChange={(e) => setPostForm({ ...postForm, start_date: e.target.value })}
              />
              <input
                type="datetime-local"
                placeholder="End Date"
                onChange={(e) => setPostForm({ ...postForm, end_date: e.target.value })}
              />
              <textarea
                className="md:col-span-3"
                placeholder="Description"
                value={postForm.description || ''}
                onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
              />
              <button
                type="button"
                onClick={async () => {
                  const payload = {
                    title: postForm.title,
                    description: postForm.description,
                    start_date: postForm.start_date,
                    end_date: postForm.end_date,
                    division: 'site',
                  };
                  const { error } = await supabase.from('events').insert(payload);
                  if (error) alert(`Create failed: ${error.message}`);
                  else {
                    clearPostForm();
                    refreshAll();
                    alert('Event created.');
                  }
                }}
                className="md:col-span-3 px-4 py-2 rounded bg-blue-600 text-white"
              >
                Add Event
              </button>
            </div>
            <EventCalendar events={events} />
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Events List</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="py-2">Title</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id} className="border-b dark:border-gray-800">
                      <td className="py-2">{ev.title}</td>
                      <td className="py-2">{new Date(ev.start_date).toLocaleString()}</td>
                      <td className="py-2">{ev.end_date ? new Date(ev.end_date).toLocaleString() : '—'}</td>
                      <td className="py-2">
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded"
                          onClick={() => deleteEvent(ev.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 opacity-70">
                        No events yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>
    </>
  );
}

export default Admin;