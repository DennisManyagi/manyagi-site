import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import EventCalendar from '@/components/Calendar'; // Added for calendar
import SEO from '@/components/SEO'; // Added for SEO (example in blog tab)

const MDXRemote = dynamic(() => import('next-mdx-remote').then(m => m.MDXRemote), { ssr: false });
const mdxSerialize = async (content) => (await import('next-mdx-remote/serialize')).serialize(content || '');

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [siteConfig, setSiteConfig] = useState({});
  const [users, setUsers] = useState([]); // Users tab
  const [properties, setProperties] = useState([]); // Realty
  const [affiliates, setAffiliates] = useState([]); // Affiliates
  const [bundles, setBundles] = useState([]); // Bundles
  const [events, setEvents] = useState([]); // Added for events
  const [newEvent, setNewEvent] = useState({ title: '', date: '', division: 'publishing', description: '' }); // Added for event form

  const [newProduct, setNewProduct] = useState({ name: '', price: '', division: 'designs', description: '', image_url: '', status: 'active', metadata: '' });
  const [newAsset, setNewAsset] = useState({ file: null, file_type: 'image', division: 'site', purpose: 'general', metadata: '' });
  const [newProperty, setNewProperty] = useState({ name: '', price: '', description: '', image_url: '', status: 'active' });
  const [newAffiliate, setNewAffiliate] = useState({ user_id: '', referral_code: '' });
  const [newBundle, setNewBundle] = useState({ name: '', price: '', items: '', division: 'publishing' });
  const [editUser, setEditUser] = useState(null); // For editing user roles

  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState({ id: null, title: '', slug: '', excerpt: '', content: '', featured_image: '', status: 'draft' });
  const [showPreview, setShowPreview] = useState(false);
  const [mdx, setMdx] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: userRow } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
      if (userRow?.role !== 'admin') { router.push('/dashboard'); return; }
      setIsAdmin(true);

      await refreshAll();
      setLoading(false);
    })();
  }, [router]);

  const refreshAll = async () => {
    const [p, o, s, a, c, b, u, prop, aff, bund, ev] = await Promise.all([ // Added ev for events
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
      supabase.from('assets').select('*').order('created_at', { ascending: false }),
      supabase.from('site_config').select('*'),
      supabase.from('posts').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('*').order('created_at', { ascending: false }), // Users
      supabase.from('properties').select('*').order('created_at', { ascending: false }), // Properties
      supabase.from('affiliates').select('*').order('created_at', { ascending: false }), // Affiliates
      supabase.from('bundles').select('*').order('created_at', { ascending: false }), // Bundles
      supabase.from('events').select('*').order('created_at', { ascending: false }), // Added: Fetch events
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
    setEvents(ev.data || []); // Added: Set events
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newProduct, price: parseFloat(newProduct.price), metadata: newProduct.metadata ? JSON.parse(newProduct.metadata) : {} };
      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;
      setNewProduct({ name: '', price: '', division: 'designs', description: '', image_url: '', status: 'active', metadata: '' });
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
      const stamp = Date.now();
      const folder = newAsset.file_type === 'image' ? 'images' : newAsset.file_type === 'video' ? 'videos' : 'pdfs';
      const path = `${folder}/${stamp}-${newAsset.file.name}`;

      const { error: upErr } = await supabase.storage.from('assets').upload(path, newAsset.file, { upsert: false });
      if (upErr) throw upErr;

      const { data: publicUrlRes } = supabase.storage.from('assets').getPublicUrl(path);
      const file_url = publicUrlRes?.publicUrl;

      const { error: insErr } = await supabase.from('assets').insert({
        file_url,
        file_type: newAsset.file_type,
        division: newAsset.division,
        purpose: newAsset.purpose,
        metadata: newAsset.metadata ? JSON.parse(newAsset.metadata) : {}
      });
      if (insErr) throw insErr;

      if (['hero', 'logo', 'favicon'].includes(newAsset.purpose)) {
        await supabase.from('site_config').upsert({ key: newAsset.purpose, value: { file_url } });
      } else if (newAsset.purpose === 'carousel') {
        const { data: existing } = await supabase.from('site_config').select('*').eq('key', 'carousel_images').maybeSingle();
        const current = existing?.value || [];
        const updated = [...current, file_url].slice(-5);
        await supabase.from('site_config').upsert({ key: 'carousel_images', value: updated });
      }

      setNewAsset({ file: null, file_type: 'image', division: 'site', purpose: 'general', metadata: '' });
      await refreshAll();
      alert('Asset uploaded.');
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
      const payload = { ...newBundle, price: parseFloat(newBundle.price), items: JSON.parse(newBundle.items || '[]') };
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

  // Added: Event CRUD handlers
  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('events').insert({
        ...newEvent,
        date: new Date(newEvent.date).toISOString(),
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
      const { error } = await supabase.from('events').update({
        ...updated,
        date: new Date(updated.date).toISOString(),
      }).eq('id', id);
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

  const loadPostToForm = (p) => {
    setPostForm({ id: p.id, title: p.title || '', slug: p.slug || '', excerpt: p.excerpt || '', content: p.content || '', featured_image: p.featured_image || '', status: p.status || 'draft' });
    setShowPreview(false);
    setMdx(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const clearPostForm = () => { setPostForm({ id: null, title: '', slug: '', excerpt: '', content: '', featured_image: '', status: 'draft' }); setShowPreview(false); setMdx(null); };
  const savePost = async (e) => {
    e.preventDefault();
    try {
      const payload = { title: postForm.title, slug: postForm.slug, excerpt: postForm.excerpt, content: postForm.content, featured_image: postForm.featured_image, status: postForm.status, author_id: user.id };
      if (postForm.id) { const { error } = await supabase.from('posts').update(payload).eq('id', postForm.id); if (error) throw error; alert('Post updated.'); }
      else { const { error } = await supabase.from('posts').insert(payload); if (error) throw error; alert('Post created.'); }
      clearPostForm(); await refreshAll();
    } catch (err) { alert(`Failed to save post: ${err.message}`); }
  };
  const publishToggle = async (postId, nextStatus) => { const { error } = await supabase.from('posts').update({ status: nextStatus }).eq('id', postId); if (error) alert(error.message); else refreshAll(); };
  const deletePost = async (postId) => { if (!confirm('Delete this post?')) return; const { error } = await supabase.from('posts').delete().eq('id', postId); if (error) alert(error.message); else { if (postForm.id === postId) clearPostForm(); refreshAll(); } };
  const doPreview = async () => { try { const ser = await mdxSerialize(postForm.content || ''); setMdx(ser); setShowPreview(true); } catch (err) { alert(`MDX parse error: ${err.message}`); } };

  if (loading) return <p className="p-6">Loading admin dashboard…</p>;
  if (!isAdmin) return <p className="p-6">Not authorized.</p>;

  return (
    <>
      <Head><title>Manyagi Admin Dashboard</title></Head>
      <div className="container mx-auto px-4 py-8 space-y-12 gradient-bg dark:bg-gray-900"> {/* Added dark mode class */}
        {/* Tabs */}
        <nav className="flex gap-4 mb-6 flex-wrap">
          <button onClick={() => setActiveTab('overview')} className={`p-2 ${activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Overview</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('publishing')} className={`p-2 ${activeTab === 'publishing' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Publishing</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('designs')} className={`p-2 ${activeTab === 'designs' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Designs</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('capital')} className={`p-2 ${activeTab === 'capital' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Capital</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('tech')} className={`p-2 ${activeTab === 'tech' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Tech</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('media')} className={`p-2 ${activeTab === 'media' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Media</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('realty')} className={`p-2 ${activeTab === 'realty' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Realty</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('blog')} className={`p-2 ${activeTab === 'blog' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Blog</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('affiliates')} className={`p-2 ${activeTab === 'affiliates' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Affiliates</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('bundles')} className={`p-2 ${activeTab === 'bundles' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Bundles</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('users')} className={`p-2 ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Users</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('analytics')} className={`p-2 ${activeTab === 'analytics' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Analytics</button> {/* Added dark mode */}
          <button onClick={() => setActiveTab('events')} className={`p-2 ${activeTab === 'events' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>Events</button> {/* Added Events tab */}
        </nav>

        {activeTab === 'overview' && (
          <section className="glass p-6 rounded"> {/* Original */}
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <p>Total Orders: {orders.length}</p>
            <p>Total Subscriptions: {subscriptions.length}</p>
            <p>Total Revenue: ${orders.reduce((acc, o) => acc + Number(o.total_amount), 0).toFixed(2)}</p>
            <p>Total Users: {users.length}</p>
          </section>
        )}

        {/* Division Tabs (Example for Publishing; repeat for others with pre-set division */}
        {activeTab === 'publishing' && (
          <section className="glass p-6 rounded"> {/* Original */}
            <h2 className="text-2xl font-bold mb-4">Publishing Division</h2>
            {/* Product Form - Pre-set division */}
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800"> {/* Added dark mode */}
              <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              <select value={newProduct.division} onChange={(e) => setNewProduct({...newProduct, division: e.target.value})} disabled>
                <option value="publishing">publishing</option>
              </select>
              <input placeholder="Image URL" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} className="col-span-3" />
              <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="col-span-3" />
              <select value={newProduct.status} onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}>
                <option value="active">active</option>
                <option value="draft">draft</option>
              </select>
              <input placeholder="Metadata JSON" value={newProduct.metadata} onChange={(e) => setNewProduct({...newProduct, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Product</button> {/* Added dark mode */}
            </form>
            {/* List Products */}
            <table className="w-full text-sm">
              {products.filter(p => p.division === 'publishing').map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  {/* Add edit/delete buttons */}
                </tr>
              ))}
            </table>
            {/* Asset Form - Pre-set division */}
            <form onSubmit={handleUploadAsset} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800"> {/* Added dark mode */}
              <input type="file" onChange={(e) => setNewAsset({...newAsset, file: e.target.files[0]})} />
              <select value={newAsset.file_type} onChange={(e) => setNewAsset({...newAsset, file_type: e.target.value})}>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>
              <select value={newAsset.division} onChange={(e) => setNewAsset({...newAsset, division: e.target.value})} disabled>
                <option value="publishing">publishing</option>
              </select>
              <select value={newAsset.purpose} onChange={(e) => setNewAsset({...newAsset, purpose: e.target.value})}>
                <option value="general">General</option>
                <option value="hero">Hero</option>
                <option value="carousel">Carousel</option>
              </select>
              <input placeholder="Metadata JSON" value={newAsset.metadata} onChange={(e) => setNewAsset({...newAsset, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Upload Asset</button> {/* Added dark mode */}
            </form>
            {/* List Assets */}
          </section>
        )}
        
        {activeTab === 'designs' && (
          <section className="glass p-6 rounded">
            <h2 className="text-2xl font-bold mb-4">Designs Division</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              <select value={newProduct.division} onChange={(e) => setNewProduct({...newProduct, division: e.target.value})} disabled>
                <option value="designs">designs</option>
              </select>
              <input placeholder="Image URL" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} className="col-span-3" />
              <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="col-span-3" />
              <select value={newProduct.status} onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}>
                <option value="active">active</option>
                <option value="draft">draft</option>
              </select>
              <input placeholder="Metadata JSON" value={newProduct.metadata} onChange={(e) => setNewProduct({...newProduct, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Product</button>
            </form>
            <table className="w-full text-sm">
              {products.filter(p => p.division === 'designs').map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  {/* Add edit/delete buttons */}
                </tr>
              ))}
            </table>
            <form onSubmit={handleUploadAsset} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input type="file" onChange={(e) => setNewAsset({...newAsset, file: e.target.files[0]})} />
              <select value={newAsset.file_type} onChange={(e) => setNewAsset({...newAsset, file_type: e.target.value})}>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>
              <select value={newAsset.division} onChange={(e) => setNewAsset({...newAsset, division: e.target.value})} disabled>
                <option value="designs">designs</option>
              </select>
              <select value={newAsset.purpose} onChange={(e) => setNewAsset({...newAsset, purpose: e.target.value})}>
                <option value="general">General</option>
                <option value="hero">Hero</option>
                <option value="carousel">Carousel</option>
              </select>
              <input placeholder="Metadata JSON" value={newAsset.metadata} onChange={(e) => setNewAsset({...newAsset, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Upload Asset</button>
            </form>
            {/* List Assets */}
          </section>
        )}

        {activeTab === 'capital' && (
          <section className="glass p-6 rounded">
            <h2 className="text-2xl font-bold mb-4">Capital Division</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              <select value={newProduct.division} onChange={(e) => setNewProduct({...newProduct, division: e.target.value})} disabled>
                <option value="capital">capital</option>
              </select>
              <input placeholder="Image URL" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} className="col-span-3" />
              <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="col-span-3" />
              <select value={newProduct.status} onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}>
                <option value="active">active</option>
                <option value="draft">draft</option>
              </select>
              <input placeholder="Metadata JSON" value={newProduct.metadata} onChange={(e) => setNewProduct({...newProduct, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Product</button>
            </form>
            <table className="w-full text-sm">
              {products.filter(p => p.division === 'capital').map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  {/* Add edit/delete buttons */}
                </tr>
              ))}
            </table>
            <form onSubmit={handleUploadAsset} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input type="file" onChange={(e) => setNewAsset({...newAsset, file: e.target.files[0]})} />
              <select value={newAsset.file_type} onChange={(e) => setNewAsset({...newAsset, file_type: e.target.value})}>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>
              <select value={newAsset.division} onChange={(e) => setNewAsset({...newAsset, division: e.target.value})} disabled>
                <option value="capital">capital</option>
              </select>
              <select value={newAsset.purpose} onChange={(e) => setNewAsset({...newAsset, purpose: e.target.value})}>
                <option value="general">General</option>
                <option value="hero">Hero</option>
                <option value="carousel">Carousel</option>
              </select>
              <input placeholder="Metadata JSON" value={newAsset.metadata} onChange={(e) => setNewAsset({...newAsset, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Upload Asset</button>
            </form>
            {/* List Assets */}
          </section>
        )}

        {activeTab === 'tech' && (
          <section className="glass p-6 rounded">
            <h2 className="text-2xl font-bold mb-4">Tech Division</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              <select value={newProduct.division} onChange={(e) => setNewProduct({...newProduct, division: e.target.value})} disabled>
                <option value="tech">tech</option>
              </select>
              <input placeholder="Image URL" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} className="col-span-3" />
              <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="col-span-3" />
              <select value={newProduct.status} onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}>
                <option value="active">active</option>
                <option value="draft">draft</option>
              </select>
              <input placeholder="Metadata JSON" value={newProduct.metadata} onChange={(e) => setNewProduct({...newProduct, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Product</button>
            </form>
            <table className="w-full text-sm">
              {products.filter(p => p.division === 'tech').map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  {/* Add edit/delete buttons */}
                </tr>
              ))}
            </table>
            <form onSubmit={handleUploadAsset} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input type="file" onChange={(e) => setNewAsset({...newAsset, file: e.target.files[0]})} />
              <select value={newAsset.file_type} onChange={(e) => setNewAsset({...newAsset, file_type: e.target.value})}>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>
              <select value={newAsset.division} onChange={(e) => setNewAsset({...newAsset, division: e.target.value})} disabled>
                <option value="tech">tech</option>
              </select>
              <select value={newAsset.purpose} onChange={(e) => setNewAsset({...newAsset, purpose: e.target.value})}>
                <option value="general">General</option>
                <option value="hero">Hero</option>
                <option value="carousel">Carousel</option>
              </select>
              <input placeholder="Metadata JSON" value={newAsset.metadata} onChange={(e) => setNewAsset({...newAsset, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Upload Asset</button>
            </form>
            {/* List Assets */}
          </section>
        )}

        {activeTab === 'media' && (
          <section className="glass p-6 rounded">
            <h2 className="text-2xl font-bold mb-4">Media Division</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              <select value={newProduct.division} onChange={(e) => setNewProduct({...newProduct, division: e.target.value})} disabled>
                <option value="media">media</option>
              </select>
              <input placeholder="Image URL" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} className="col-span-3" />
              <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="col-span-3" />
              <select value={newProduct.status} onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}>
                <option value="active">active</option>
                <option value="draft">draft</option>
              </select>
              <input placeholder="Metadata JSON" value={newProduct.metadata} onChange={(e) => setNewProduct({...newProduct, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Product</button>
            </form>
            <table className="w-full text-sm">
              {products.filter(p => p.division === 'media').map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  {/* Add edit/delete buttons */}
                </tr>
              ))}
            </table>
            <form onSubmit={handleUploadAsset} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input type="file" onChange={(e) => setNewAsset({...newAsset, file: e.target.files[0]})} />
              <select value={newAsset.file_type} onChange={(e) => setNewAsset({...newAsset, file_type: e.target.value})}>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>
              <select value={newAsset.division} onChange={(e) => setNewAsset({...newAsset, division: e.target.value})} disabled>
                <option value="media">media</option>
              </select>
              <select value={newAsset.purpose} onChange={(e) => setNewAsset({...newAsset, purpose: e.target.value})}>
                <option value="general">General</option>
                <option value="hero">Hero</option>
                <option value="carousel">Carousel</option>
              </select>
              <input placeholder="Metadata JSON" value={newAsset.metadata} onChange={(e) => setNewAsset({...newAsset, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Upload Asset</button>
            </form>
            {/* List Assets */}
          </section>
        )}

        {activeTab === 'realty' && (
          <section className="glass p-6 rounded">
            <h2 className="text-2xl font-bold mb-4">Realty Division</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              <select value={newProduct.division} onChange={(e) => setNewProduct({...newProduct, division: e.target.value})} disabled>
                <option value="realty">realty</option>
              </select>
              <input placeholder="Image URL" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} className="col-span-3" />
              <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="col-span-3" />
              <select value={newProduct.status} onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}>
                <option value="active">active</option>
                <option value="draft">draft</option>
              </select>
              <input placeholder="Metadata JSON" value={newProduct.metadata} onChange={(e) => setNewProduct({...newProduct, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Product</button>
            </form>
            <table className="w-full text-sm">
              {products.filter(p => p.division === 'realty').map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  {/* Add edit/delete buttons */}
                </tr>
              ))}
            </table>
            <form onSubmit={handleUploadAsset} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input type="file" onChange={(e) => setNewAsset({...newAsset, file: e.target.files[0]})} />
              <select value={newAsset.file_type} onChange={(e) => setNewAsset({...newAsset, file_type: e.target.value})}>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>
              <select value={newAsset.division} onChange={(e) => setNewAsset({...newAsset, division: e.target.value})} disabled>
                <option value="realty">realty</option>
              </select>
              <select value={newAsset.purpose} onChange={(e) => setNewAsset({...newAsset, purpose: e.target.value})}>
                <option value="general">General</option>
                <option value="hero">Hero</option>
                <option value="carousel">Carousel</option>
              </select>
              <input placeholder="Metadata JSON" value={newAsset.metadata} onChange={(e) => setNewAsset({...newAsset, metadata: e.target.value})} className="col-span-2" />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Upload Asset</button>
            </form>
            {/* List Assets */}
          </section>
        )}

        {activeTab === 'blog' && (
          <section className="glass p-6 rounded">
            <SEO title="Manyagi Admin - Blog Management" description="Manage blog posts for Manyagi divisions." />
            <h2 className="text-2xl font-bold mb-4">Blog</h2>
            {/* Post Form */}
            <form onSubmit={savePost} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800">
              <input placeholder="Title" value={postForm.title} onChange={(e) => setPostForm({...postForm, title: e.target.value})} />
              <input placeholder="Slug" value={postForm.slug} onChange={(e) => setPostForm({...postForm, slug: e.target.value})} />
              <input placeholder="Excerpt" value={postForm.excerpt} onChange={(e) => setPostForm({...postForm, excerpt: e.target.value})} className="col-span-2" />
              <input placeholder="Featured Image URL" value={postForm.featured_image} onChange={(e) => setPostForm({...postForm, featured_image: e.target.value})} className="col-span-2" />
              <textarea placeholder="Content (MDX)" value={postForm.content} onChange={(e) => setPostForm({...postForm, content: e.target.value})} className="col-span-2 h-32" />
              <select value={postForm.status} onChange={(e) => setPostForm({...postForm, status: e.target.value})}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Save Post</button>
              <button type="button" onClick={doPreview} className="p-2 bg-gray-500 text-white rounded">Preview</button>
              <button type="button" onClick={clearPostForm} className="p-2 bg-red-500 text-white rounded">Clear</button>
            </form>
            {showPreview && mdx && (
              <div className="glass p-6 rounded mb-6">
                <MDXRemote {...mdx} />
              </div>
            )}
            {/* List Posts */}
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.status}</td>
                    <td>
                      <button onClick={() => loadPostToForm(p)} className="text-blue-500 mr-2">Edit</button>
                      <button onClick={() => publishToggle(p.id, p.status === 'published' ? 'draft' : 'published')} className="text-green-500 mr-2">
                        {p.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => deletePost(p.id)} className="text-red-500">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Affiliates Tab */}
        {activeTab === 'affiliates' && (
          <section className="glass p-6 rounded"> {/* Original */}
            <h2 className="text-2xl font-bold mb-4">Affiliates</h2>
            <form onSubmit={handleAddAffiliate}>
              <input placeholder="User ID" value={newAffiliate.user_id} onChange={(e) => setNewAffiliate({...newAffiliate, user_id: e.target.value})} />
              <input placeholder="Referral Code" value={newAffiliate.referral_code} onChange={(e) => setNewAffiliate({...newAffiliate, referral_code: e.target.value})} />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Affiliate</button> {/* Added dark mode */}
            </form>
            <table className="w-full text-sm">
              {affiliates.map(aff => (
                <tr key={aff.id}>
                  <td>{aff.user_id}</td>
                  <td>{aff.referral_code}</td>
                  {/* Edit/delete */}
                </tr>
              ))}
            </table>
          </section>
        )}

        {/* Bundles Tab */}
        {activeTab === 'bundles' && (
          <section className="glass p-6 rounded"> {/* Original */}
            <h2 className="text-2xl font-bold mb-4">Bundles</h2>
            <form onSubmit={handleAddBundle}>
              <input placeholder="Name" value={newBundle.name} onChange={(e) => setNewBundle({...newBundle, name: e.target.value})} />
              <input placeholder="Price" type="number" value={newBundle.price} onChange={(e) => setNewBundle({...newBundle, price: e.target.value})} />
              <textarea placeholder="Items JSON (e.g. ['prod1', 'prod2'])" value={newBundle.items} onChange={(e) => setNewBundle({...newBundle, items: e.target.value})} />
              <select value={newBundle.division} onChange={(e) => setNewBundle({...newBundle, division: e.target.value})}>
                <option value="publishing">publishing</option>
                <option value="designs">designs</option>
                {/* ... */}
              </select>
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Bundle</button> {/* Added dark mode */}
            </form>
            <table className="w-full text-sm">
              {bundles.map(b => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  {/* Edit/delete */}
                </tr>
              ))}
            </table>
          </section>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <section className="glass p-6 rounded"> {/* Original */}
            <h2 className="text-2xl font-bold mb-4">Users</h2>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <select value={u.role} onChange={(e) => handleEditUserRole(u.id, e.target.value)} className="dark:bg-gray-800"> {/* Added dark mode */}
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <section className="glass p-6 rounded"> {/* Original */}
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3>Orders Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={orders}>
                    <XAxis dataKey="created_at" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3>Subscriptions Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subscriptions}>
                    <XAxis dataKey="created_at" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="status" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <a href="https://app.posthog.com" target="_blank" rel="noopener noreferrer" className="btn bg-blue-500 text-white p-2 rounded mt-4">
              View Full PostHog Analytics
            </a>
          </section>
        )}

        {activeTab === 'events' && ( // Added Events section
          <section className="glass p-6 rounded">
            <h2 className="text-2xl font-bold mb-4">Events</h2>
            {/* Event Form */}
            <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800"> {/* Added dark mode */}
              <input
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
              <input
                type="datetime-local"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              />
              <select
                value={newEvent.division}
                onChange={(e) => setNewEvent({...newEvent, division: e.target.value})}
              >
                <option value="publishing">Publishing</option>
                <option value="designs">Designs</option>
                <option value="capital">Capital</option>
                <option value="tech">Tech</option>
                <option value="media">Media</option>
                <option value="realty">Realty</option>
              </select>
              <textarea
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                className="col-span-3"
              />
              <button className="p-2 bg-black text-white rounded dark:bg-gray-700">Add Event</button> {/* Added dark mode */}
            </form>
            {/* Event List with CRUD */}
            <table className="w-full text-sm border-collapse mb-6">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Division</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td>{new Date(e.date).toLocaleString()}</td>
                    <td>{e.division}</td>
                    <td>
                      <button
                        onClick={() => setNewEvent({ ...e, date: new Date(e.date).toISOString().slice(0, 16) })}
                        className="text-blue-500"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteEvent(e.id)} className="text-red-500 ml-2">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Calendar View */}
            <EventCalendar events={events} />
          </section>
        )}
      </div>
    </>
  );
}