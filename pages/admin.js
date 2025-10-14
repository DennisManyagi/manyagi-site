// ===== pages/admin.js =====
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

import { supabase } from '@/lib/supabase';
import EventCalendar from '@/components/Calendar';
import SEO from '@/components/SEO';

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';

// MDX (lazy to keep admin fast)
const MDXRemote = dynamic(() => import('next-mdx-remote').then(m => m.MDXRemote), { ssr: false });
const mdxSerialize = async (content) =>
  (await import('next-mdx-remote/serialize')).serialize(content || '');

// ---------- UI helpers ----------
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded transition
      ${active ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
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

// ---------- Page ----------
export default function Admin() {
  const router = useRouter();

  // auth
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // core data
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

  // forms
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', division: 'designs', description: '', image_url: '', status: 'active', metadata: '',
  });
  const [newAsset, setNewAsset] = useState({
    file: null, file_type: 'image', division: 'site', purpose: 'general', metadata: '',
  });
  const [newProperty, setNewProperty] = useState({
    name: '', price: '', description: '', image_url: '', status: 'active',
  });
  const [newAffiliate, setNewAffiliate] = useState({ user_id: '', referral_code: '' });
  const [newBundle, setNewBundle] = useState({ name: '', price: '', items: '', division: 'publishing' });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', division: 'publishing', description: '' });

  // blog
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState({
    id: null, title: '', slug: '', excerpt: '', content: '', featured_image: '', status: 'draft',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [mdx, setMdx] = useState(null);

  // ui
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // --------- lifecycle ----------
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: userRow } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (userRow?.role !== 'admin') { router.push('/dashboard'); return; }
      setIsAdmin(true);

      await refreshAll();
      setLoading(false);
    })();
  }, [router]);

  // --------- data fetch ----------
  const refreshAll = async () => {
    const [
      p, o, s, a, c, b, u, prop, aff, bund, ev,
    ] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
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

  // --------- handlers: products / assets / etc. ----------
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price || 0),
        metadata: newProduct.metadata ? JSON.parse(newProduct.metadata) : {},
      };
      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;
      setNewProduct({ name: '', price: '', division: newProduct.division, description: '', image_url: '', status: 'active', metadata: '' });
      await refreshAll();
      alert('Product added.');
    } catch (err) {
      alert(`Failed to add product: ${err.message}`);
    }
  };

  const handleUploadAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.file) { alert('Please select a file'); return; }
    try {
      const reader = new FileReader();
      reader.readAsDataURL(newAsset.file);
      reader.onload = async () => {
        try {
          const base64 = String(reader.result || '').split(',')[1] || '';
          const res = await axios.post('/api/admin/upload-asset', {
            file: { data: base64, name: newAsset.file.name },
            file_type: newAsset.file_type,
            division: newAsset.division,
            purpose: newAsset.purpose,
            metadata: newAsset.metadata,
          });
          if (res.data?.error) throw new Error(res.data.error);
          setNewAsset({ file: null, file_type: 'image', division: newAsset.division, purpose: 'general', metadata: '' });
          await refreshAll();
          alert('Asset uploaded.');
        } catch (err) {
          alert(`Upload failed: ${err.message}`);
        }
      };
      reader.onerror = () => { alert('File read error'); };
    } catch (err) {
      alert(`Failed to upload asset: ${err.message}`);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('properties').insert(newProperty);
      if (error) throw error;
      setNewProperty({ name: '', price: '', description: '', image_url: '', status: 'active' });
      await refreshAll();
      alert('Property added.');
    } catch (err) {
      alert(`Failed to add property: ${err.message}`);
    }
  };

  const handleAddAffiliate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('affiliates').insert(newAffiliate);
      if (error) throw error;
      setNewAffiliate({ user_id: '', referral_code: '' });
      await refreshAll();
      alert('Affiliate added.');
    } catch (err) {
      alert(`Failed to add affiliate: ${err.message}`);
    }
  };

  const handleAddBundle = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newBundle,
        price: parseFloat(newBundle.price || 0),
        items: JSON.parse(newBundle.items || '[]'),
      };
      const { error } = await supabase.from('bundles').insert(payload);
      if (error) throw error;
      setNewBundle({ name: '', price: '', items: '', division: 'publishing' });
      await refreshAll();
      alert('Bundle added.');
    } catch (err) {
      alert(`Failed to add bundle: ${err.message}`);
    }
  };

  const handleEditUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      await refreshAll();
      alert('User role updated.');
    } catch (err) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  // events
  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('events').insert({
        ...newEvent,
        date: newEvent.date ? new Date(newEvent.date).toISOString() : null,
      });
      if (error) throw error;
      setNewEvent({ title: '', date: '', division: 'publishing', description: '' });
      await refreshAll();
      alert('Event added.');
    } catch (err) {
      alert(`Failed to add event: ${err.message}`);
    }
  };

  const handleUpdateEvent = async (id, updated) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ ...updated, date: updated.date ? new Date(updated.date).toISOString() : null })
        .eq('id', id);
      if (error) throw error;
      await refreshAll();
      alert('Event updated.');
    } catch (err) {
      alert(`Failed to update: ${err.message}`);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete event?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      await refreshAll();
      alert('Event deleted.');
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  // blog helpers
  const loadPostToForm = (p) => {
    setPostForm({
      id: p.id,
      title: p.title || '',
      slug: p.slug || '',
      excerpt: p.excerpt || '',
      content: p.content || '',
      featured_image: p.featured_image || '',
      status: p.status || 'draft',
    });
    setShowPreview(false);
    setMdx(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const clearPostForm = () => {
    setPostForm({ id: null, title: '', slug: '', excerpt: '', content: '', featured_image: '', status: 'draft' });
    setShowPreview(false);
    setMdx(null);
  };
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
        author_id: user.id,
      };
      if (postForm.id) {
        const { error } = await supabase.from('posts').update(payload).eq('id', postForm.id);
        if (error) throw error;
        alert('Post updated.');
      } else {
        const { error } = await supabase.from('posts').insert(payload);
        if (error) throw error;
        alert('Post created.');
      }
      clearPostForm();
      await refreshAll();
    } catch (err) {
      alert(`Failed to save post: ${err.message}`);
    }
  };
  const publishToggle = async (postId, nextStatus) => {
    const { error } = await supabase.from('posts').update({ status: nextStatus }).eq('id', postId);
    if (error) alert(error.message); else refreshAll();
  };
  const deletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) alert(error.message);
    else { if (postForm.id === postId) clearPostForm(); refreshAll(); }
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

  // derived
  const totalRevenue = useMemo(
    () => orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0),
    [orders],
  );

  // guards
  if (loading) return <p className="p-6">Loading admin dashboard…</p>;
  if (!isAdmin) return <p className="p-6">Not authorized.</p>;

  // ---------- render ----------
  return (
    <>
      <Head><title>Manyagi Admin Dashboard</title></Head>

      <div className="container mx-auto px-4 py-8 space-y-12 gradient-bg dark:bg-gray-900">
        {/* Tabs */}
        <nav className="flex gap-2 mb-6 flex-wrap">
          {[
            'overview','publishing','designs','capital','tech','media','realty',
            'blog','affiliates','bundles','users','analytics','events',
          ].map(tab => (
            <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabButton>
          ))}
        </nav>

        {/* Overview */}
        {activeTab === 'overview' && (
          <SectionCard title="Overview">
            <p>Total Orders: {orders.length}</p>
            <p>Total Subscriptions: {subscriptions.length}</p>
            <p>Total Revenue: ${totalRevenue.toFixed(2)}</p>
            <p>Total Users: {users.length}</p>
          </SectionCard>
        )}

        {/* Division: Publishing */}
        {activeTab === 'publishing' && (
          <SectionCard title="Publishing Division">
            {/* Product Form */}
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              <input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
              <select value={newProduct.division} onChange={(e) => setNewProduct({ ...newProduct, division: e.target.value })} disabled>
                <option value="publishing">publishing</option>
              </select>
              <input placeholder="Image URL" className="col-span-3" value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} />
              <textarea placeholder="Description" className="col-span-3" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
              <select value={newProduct.status} onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}>
                <option value="active">active</option>
                <option value="draft">draft</option>
              </select>
              <input placeholder="Metadata JSON" className="col-span-2" value={newProduct.metadata} onChange={(e) => setNewProduct({ ...newProduct, metadata: e.target.value })} />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Product</button>
            </form>

            {/* List Products */}
            <table className="w-full text-sm">
              <thead><tr><th>Name</th></tr></thead>
              <tbody>
                {products.filter(p => p.division === 'publishing').map(p => (
                  <tr key={p.id}><td>{p.name}</td></tr>
                ))}
              </tbody>
            </table>

            {/* Asset Form */}
            <form onSubmit={handleUploadAsset} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input type="file" onChange={(e) => setNewAsset({ ...newAsset, file: e.target.files?.[0] || null })} />
              <select value={newAsset.file_type} onChange={(e) => setNewAsset({ ...newAsset, file_type: e.target.value })}>
                <option value="image">Image</option><option value="video">Video</option><option value="pdf">PDF</option>
              </select>
              <select value={newAsset.division} onChange={(e) => setNewAsset({ ...newAsset, division: e.target.value })} disabled>
                <option value="publishing">publishing</option>
              </select>
              <select value={newAsset.purpose} onChange={(e) => setNewAsset({ ...newAsset, purpose: e.target.value })}>
                <option value="general">General</option><option value="hero">Hero</option><option value="carousel">Carousel</option>
              </select>
              <input placeholder="Metadata JSON" className="col-span-2" value={newAsset.metadata} onChange={(e) => setNewAsset({ ...newAsset, metadata: e.target.value })} />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Upload Asset</button>
            </form>
          </SectionCard>
        )}

        {/* Designs / Capital / Tech / Media / Realty — same pattern */}
        {['designs','capital','tech','media','realty'].includes(activeTab) && (
          <SectionCard title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Division`}>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              <input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
              <select value={newProduct.division} onChange={(e) => setNewProduct({ ...newProduct, division: e.target.value })} disabled>
                <option value={activeTab}>{activeTab}</option>
              </select>
              <input placeholder="Image URL" className="col-span-3" value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} />
              <textarea placeholder="Description" className="col-span-3" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
              <select value={newProduct.status} onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}>
                <option value="active">active</option><option value="draft">draft</option>
              </select>
              <input placeholder="Metadata JSON" className="col-span-2" value={newProduct.metadata} onChange={(e) => setNewProduct({ ...newProduct, metadata: e.target.value })} />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Product</button>
            </form>

            <table className="w-full text-sm">
              <thead><tr><th>Name</th></tr></thead>
              <tbody>
                {products.filter(p => p.division === activeTab).map(p => (
                  <tr key={p.id}><td>{p.name}</td></tr>
                ))}
              </tbody>
            </table>

            <form onSubmit={handleUploadAsset} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input type="file" onChange={(e) => setNewAsset({ ...newAsset, file: e.target.files?.[0] || null })} />
              <select value={newAsset.file_type} onChange={(e) => setNewAsset({ ...newAsset, file_type: e.target.value })}>
                <option value="image">Image</option><option value="video">Video</option><option value="pdf">PDF</option>
              </select>
              <select value={newAsset.division} onChange={(e) => setNewAsset({ ...newAsset, division: e.target.value })} disabled>
                <option value={activeTab}>{activeTab}</option>
              </select>
              <select value={newAsset.purpose} onChange={(e) => setNewAsset({ ...newAsset, purpose: e.target.value })}>
                <option value="general">General</option><option value="hero">Hero</option><option value="carousel">Carousel</option>
              </select>
              <input placeholder="Metadata JSON" className="col-span-2" value={newAsset.metadata} onChange={(e) => setNewAsset({ ...newAsset, metadata: e.target.value })} />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Upload Asset</button>
            </form>
          </SectionCard>
        )}

        {/* Blog */}
        {activeTab === 'blog' && (
          <SectionCard title="Blog">
            <SEO title="Manyagi Admin - Blog Management" description="Manage blog posts for Manyagi divisions." />
            <form onSubmit={savePost} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input placeholder="Title" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
              <input placeholder="Slug" value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} />
              <input className="col-span-2" placeholder="Excerpt" value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} />
              <input className="col-span-2" placeholder="Featured Image URL" value={postForm.featured_image} onChange={(e) => setPostForm({ ...postForm, featured_image: e.target.value })} />
              <textarea className="col-span-2 h-32" placeholder="Content (MDX)" value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} />
              <select value={postForm.status} onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}>
                <option value="draft">Draft</option><option value="published">Published</option>
              </select>
              <div className="flex gap-2">
                <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Save Post</button>
                <button type="button" onClick={doPreview} className="p-2 bg-gray-500 text-white rounded">Preview</button>
                <button type="button" onClick={clearPostForm} className="p-2 bg-red-500 text-white rounded">Clear</button>
              </div>
            </form>

            {showPreview && mdx && (
              <SectionCard><MDXRemote {...mdx} /></SectionCard>
            )}

            <table className="w-full text-sm">
              <thead>
                <tr><th>Title</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.status}</td>
                    <td className="space-x-2">
                      <button onClick={() => loadPostToForm(p)} className="text-blue-500">Edit</button>
                      <button onClick={() => publishToggle(p.id, p.status === 'published' ? 'draft' : 'published')} className="text-green-600">
                        {p.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => deletePost(p.id)} className="text-red-500">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        )}

        {/* Affiliates */}
        {activeTab === 'affiliates' && (
          <SectionCard title="Affiliates">
            <form onSubmit={handleAddAffiliate} className="flex flex-col md:flex-row gap-3 mb-6">
              <input placeholder="User ID" value={newAffiliate.user_id} onChange={(e) => setNewAffiliate({ ...newAffiliate, user_id: e.target.value })} />
              <input placeholder="Referral Code" value={newAffiliate.referral_code} onChange={(e) => setNewAffiliate({ ...newAffiliate, referral_code: e.target.value })} />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Affiliate</button>
            </form>
            <table className="w-full text-sm">
              <thead><tr><th>User</th><th>Code</th></tr></thead>
              <tbody>
                {affiliates.map(aff => (
                  <tr key={aff.id}><td>{aff.user_id}</td><td>{aff.referral_code}</td></tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        )}

        {/* Bundles */}
        {activeTab === 'bundles' && (
          <SectionCard title="Bundles">
            <form onSubmit={handleAddBundle} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <input placeholder="Name" value={newBundle.name} onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })} />
              <input placeholder="Price" type="number" value={newBundle.price} onChange={(e) => setNewBundle({ ...newBundle, price: e.target.value })} />
              <select value={newBundle.division} onChange={(e) => setNewBundle({ ...newBundle, division: e.target.value })}>
                <option value="publishing">publishing</option>
                <option value="designs">designs</option>
                <option value="capital">capital</option>
                <option value="tech">tech</option>
                <option value="media">media</option>
                <option value="realty">realty</option>
              </select>
              <textarea className="md:col-span-3" placeholder="Items JSON (e.g. ['prod1','prod2'])" value={newBundle.items} onChange={(e) => setNewBundle({ ...newBundle, items: e.target.value })} />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700 md:col-span-3">Add Bundle</button>
            </form>
            <table className="w-full text-sm">
              <thead><tr><th>Name</th></tr></thead>
              <tbody>
                {bundles.map(b => (<tr key={b.id}><td>{b.name}</td></tr>))}
              </tbody>
            </table>
          </SectionCard>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <SectionCard title="Users">
            <table className="w-full text-sm">
              <thead><tr><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <select
                        className="dark:bg-gray-800"
                        value={u.role}
                        onChange={(e) => handleEditUserRole(u.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <SectionCard title="Analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Orders Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={orders}>
                    <XAxis dataKey="created_at" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="font-semibold">Subscriptions Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subscriptions}>
                    <XAxis dataKey="created_at" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="status" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <a
              href="https://app.posthog.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-500 text-white p-2 rounded mt-4"
            >
              View Full PostHog Analytics
            </a>
          </SectionCard>
        )}

        {/* Events */}
        {activeTab === 'events' && (
          <SectionCard title="Events">
            <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input placeholder="Event Title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
              <input type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
              <select value={newEvent.division} onChange={(e) => setNewEvent({ ...newEvent, division: e.target.value })}>
                <option value="publishing">Publishing</option>
                <option value="designs">Designs</option>
                <option value="capital">Capital</option>
                <option value="tech">Tech</option>
                <option value="media">Media</option>
                <option value="realty">Realty</option>
              </select>
              <textarea className="md:col-span-3" placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700 md:col-span-3">Add Event</button>
            </form>

            <table className="w-full text-sm border-collapse mb-6">
              <thead><tr><th>Title</th><th>Date</th><th>Division</th><th>Actions</th></tr></thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td>{ev.title}</td>
                    <td>{ev.date ? new Date(ev.date).toLocaleString() : '-'}</td>
                    <td>{ev.division}</td>
                    <td className="space-x-2">
                      <button
                        onClick={() => setNewEvent({ ...ev, date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : '' })}
                        className="text-blue-500"
                      >
                        Edit in form
                      </button>
                      <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-500">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <EventCalendar events={events} />
          </SectionCard>
        )}
      </div>
    </>
  );
}
