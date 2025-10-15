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

// --- MDX (lazy for admin speed)
const MDXRemote = dynamic(() => import('next-mdx-remote').then(m => m.MDXRemote), { ssr: false });
const mdxSerialize = async (content) =>
  (await import('next-mdx-remote/serialize')).serialize(content || '');

// ---------- small utils ----------
const toArrayTags = (s) =>
  Array.from(new Set(String(s || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)));

const tagsToCSV = (arr) =>
  Array.isArray(arr) ? arr.join(', ') : '';

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
  } catch {
    // ignore
  }
};

// ---------- UI helpers ----------
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded transition ${active ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
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

// ---------- Quick Product Form (Designs) ----------
function QuickProductForm({ defaultDivision = 'designs', onCreated }) {
  const [artFile, setArtFile] = useState(null);
  const [assetUrl, setAssetUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // product fields
  const [title, setTitle] = useState('Exile Portal Tee (Prompt 1)');
  const [price, setPrice] = useState('19.99');
  const [printfulId, setPrintfulId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('Neon portal tee from Legacy of the Hidden Clans.');
  const [tagsStr, setTagsStr] = useState('LOHC, prompt-1, exile-portal, tee');

  // metadata fields
  const [metaBook, setMetaBook] = useState('LOHC');
  const [metaSeries, setMetaSeries] = useState('Legacy of the Hidden Clans');
  const [metaPrompt, setMetaPrompt] = useState(1);
  const [metaScene, setMetaScene] = useState('Exile Portal');
  const [metaYear, setMetaYear] = useState(2025);
  const [metaDrop, setMetaDrop] = useState('LOHC_Prompt_1');

  const [purpose, setPurpose] = useState('general'); // upload purpose
  const [fileType, setFileType] = useState('image'); // image / video / pdf

  const doUploadAsset = async () => {
    if (!artFile) { alert('Choose a file first.'); return; }
    setIsUploading(true);
    try {
      const reader = new FileReader();
      const promise = new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
      });
      reader.readAsDataURL(artFile);
      await promise;
      const base64 = String(reader.result || '').split(',')[1] || '';

      // bearer
      const { data: { session} } = await supabase.auth.getSession();
      const token = session?.access_token;

      const metadata = {
        book: metaBook,
        series: metaSeries,
        prompt: Number(metaPrompt),
        scene: metaScene,
        year: Number(metaYear),
        drop: metaDrop,
      };

      const res = await axios.post(
        '/api/admin/upload-asset',
        {
          file: { data: base64, name: artFile.name },
          file_type: fileType,
          division: defaultDivision,
          purpose,
          metadata
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data?.error) throw new Error(res.data.error);
      setAssetUrl(res.data.file_url || '');
      alert('Asset uploaded. Public URL attached below.');
    } catch (e) {
      alert(`Upload failed: ${e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const doCreateProduct = async () => {
    try {
      if (!title) return alert('Title is required.');
      if (!price) return alert('Price is required.');
      if (!thumbnailUrl) return alert('thumbnail_url (mockup) is required.');
      if (!printfulId) return alert('Printful product ID is required.');

      const tags = toArrayTags(tagsStr);
      const metadata = {
        book: metaBook,
        series: metaSeries,
        prompt: Number(metaPrompt),
        scene: metaScene,
        year: Number(metaYear),
        drop: metaDrop,
        asset_url: assetUrl || undefined,
      };

      const payload = {
        name: title,
        price: parseFloat(price),
        division: defaultDivision,
        description,
        thumbnail_url: thumbnailUrl,
        printful_product_id: printfulId,
        status: 'active',
        tags,
        metadata,
      };
      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;

      // reset minimal inputs
      setTitle('');
      setPrice('');
      setPrintfulId('');
      setThumbnailUrl('');
      setDescription('');
      setTagsStr('');
      setArtFile(null);

      onCreated?.();
      alert('Product created.');
    } catch (e) {
      alert(`Create product failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Quick Product (Designs) — Upload → Copy URL → Create">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1) Upload (optional) */}
        <div className="md:col-span-3 border rounded p-4 dark:border-gray-700">
          <h3 className="font-semibold mb-2">1) Upload asset (optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <input type="file" onChange={(e) => setArtFile(e.target.files?.[0] || null)} />
            <select value={fileType} onChange={e => setFileType(e.target.value)} className="dark:bg-gray-800">
              <option value="image">image</option>
              <option value="video">video</option>
              <option value="pdf">pdf</option>
            </select>
            <select value={purpose} onChange={e => setPurpose(e.target.value)} className="dark:bg-gray-800">
              <option value="general">general</option>
              <option value="hero">hero</option>
              <option value="carousel">carousel</option>
            </select>
            <button
              type="button"
              onClick={doUploadAsset}
              disabled={isUploading}
              className="p-2 bg-black text-white rounded dark:bg-gray-700"
            >
              {isUploading ? 'Uploading…' : 'Upload → Get URL'}
            </button>
          </div>

          {assetUrl ? (
            <div className="mt-3 flex items-center gap-2">
              <input value={assetUrl} readOnly className="w-full dark:bg-gray-800" />
              <button type="button" className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => copyText(assetUrl)}>Copy</button>
            </div>
          ) : null}

          <details className="mt-3">
            <summary className="cursor-pointer text-sm opacity-80">Edit default metadata</summary>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mt-3">
              <input placeholder="book" value={metaBook} onChange={e => setMetaBook(e.target.value)} />
              <input placeholder="series" value={metaSeries} onChange={e => setMetaSeries(e.target.value)} />
              <input placeholder="prompt" type="number" value={metaPrompt} onChange={e => setMetaPrompt(e.target.value)} />
              <input placeholder="scene" value={metaScene} onChange={e => setMetaScene(e.target.value)} />
              <input placeholder="year" type="number" value={metaYear} onChange={e => setMetaYear(e.target.value)} />
              <input placeholder="drop" value={metaDrop} onChange={e => setMetaDrop(e.target.value)} />
            </div>
          </details>
        </div>

        {/* 2) Create product */}
        <div className="md:col-span-3 border rounded p-4 dark:border-gray-700">
          <h3 className="font-semibold mb-2">2) Create product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <input placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
            <input placeholder="Printful Product ID" value={printfulId} onChange={e => setPrintfulId(e.target.value)} />
            <input placeholder="thumbnail_url (Printful mockup URL)" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
            <input className="md:col-span-2" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <input className="md:col-span-2" placeholder="Tags (comma-separated)" value={tagsStr} onChange={e => setTagsStr(e.target.value)} />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={doCreateProduct} className="p-2 bg-black text-white rounded dark:bg-gray-700">Create Product</button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

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

  // inline editors
  const [productEdits, setProductEdits] = useState({});
  const [assetEdits, setAssetEdits] = useState({});

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

  // --------- generic handlers ----------
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
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;

          const res = await axios.post(
            '/api/admin/upload-asset',
            {
              file: { data: base64, name: newAsset.file.name },
              file_type: newAsset.file_type,
              division: newAsset.division,
              purpose: newAsset.purpose,
              metadata: newAsset.metadata,
            },
            {
              withCredentials: true,
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );

          if (res.data?.error) throw new Error(res.data.error);
          setNewAsset({ file: null, file_type: 'image', division: newAsset.division, purpose: 'general', metadata: '' });
          await refreshAll();
          alert(`Asset uploaded.\nURL: ${res.data.file_url}`);
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

  // inline saves
  const saveProductRow = async (p) => {
    try {
      const edits = productEdits[p.id] || {};
      if (!Object.keys(edits).length) return;
      const payload = {
        ...('thumbnail_url' in edits ? { thumbnail_url: edits.thumbnail_url } : {}),
        ...('printful_product_id' in edits ? { printful_product_id: edits.printful_product_id } : {}),
        ...('price' in edits ? { price: parseFloat(edits.price || 0) } : {}),
        ...('description' in edits ? { description: edits.description } : {}),
        ...('nft_url' in edits ? { nft_url: edits.nft_url } : {}),
        ...('tagsStr' in edits ? { tags: toArrayTags(edits.tagsStr) } : {}),
        ...('metadataStr' in edits ? { metadata: safeJSON(edits.metadataStr, p.metadata || {}) } : {}),
      };
      if (!Object.keys(payload).length) return;

      const { error } = await supabase.from('products').update(payload).eq('id', p.id);
      if (error) throw error;

      // clear only this row's edits
      setProductEdits(prev => ({ ...prev, [p.id]: {} }));
      await refreshAll();
      alert('Product saved.');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
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
      if (!Object.keys(payload).length) return;

      const { error } = await supabase.from('assets').update(payload).eq('id', a.id);
      if (error) throw error;

      setAssetEdits(prev => ({ ...prev, [a.id]: {} }));
      await refreshAll();
      alert('Asset saved.');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
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

        {/* Division: Publishing (generic form kept) */}
        {activeTab === 'publishing' && (
          <SectionCard title="Publishing Division">
            {/* Product Form (generic) */}
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

            {/* List Products (publishing) */}
            <table className="w-full text-sm">
              <thead><tr><th>Name</th></tr></thead>
              <tbody>
                {products.filter(p => p.division === 'publishing').map(p => (
                  <tr key={p.id}><td>{p.name}</td></tr>
                ))}
              </tbody>
            </table>

            {/* Asset Form (generic) */}
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

        {/* Designs — enhanced */}
        {activeTab === 'designs' && (
          <SectionCard title="Designs Division">
            {/* 🚀 Quick Product Form */}
            <QuickProductForm defaultDivision="designs" onCreated={refreshAll} />

            {/* Products (Designs) with inline editing */}
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
                    <th>nft_url</th>
                    <th>Save</th>
                  </tr>
                </thead>
                <tbody>
                  {products.filter(p => p.division === 'designs').map(p => {
                    const row = productEdits[p.id] || {};
                    return (
                      <tr key={p.id} className="border-b dark:border-gray-800 align-top">
                        <td className="py-2">
                          {p.thumbnail_url ? <img src={p.thumbnail_url} alt={p.name} className="w-16 h-16 object-cover rounded" /> : null}
                        </td>
                        <td className="py-2">{p.name}</td>

                        <td className="py-2 min-w-[100px]">
                          <input
                            type="number"
                            placeholder={String(p.price ?? '')}
                            className="w-full dark:bg-gray-800"
                            value={row.price ?? (p.price ?? '')}
                            onChange={e => setProductEdits(prev => ({ ...prev, [p.id]: { ...row, price: e.target.value } }))}
                          />
                        </td>

                        <td className="py-2 min-w-[160px]">
                          <input
                            placeholder="printful_product_id"
                            className="w-full dark:bg-gray-800"
                            value={row.printful_product_id ?? (p.printful_product_id || '')}
                            onChange={e => setProductEdits(prev => ({ ...prev, [p.id]: { ...row, printful_product_id: e.target.value } }))}
                          />
                        </td>

                        <td className="py-2 min-w-[220px]">
                          <input
                            placeholder="thumbnail_url"
                            className="w-full dark:bg-gray-800"
                            value={row.thumbnail_url ?? (p.thumbnail_url || '')}
                            onChange={e => setProductEdits(prev => ({ ...prev, [p.id]: { ...row, thumbnail_url: e.target.value } }))}
                          />
                        </td>

                        <td className="py-2 min-w-[200px]">
                          <input
                            placeholder="comma,separated,tags"
                            className="w-full dark:bg-gray-800"
                            value={row.tagsStr ?? tagsToCSV(p.tags)}
                            onChange={e => setProductEdits(prev => ({ ...prev, [p.id]: { ...row, tagsStr: e.target.value } }))}
                          />
                        </td>

                        <td className="py-2 min-w-[220px]">
                          <textarea
                            placeholder="description"
                            className="w-full h-16 dark:bg-gray-800"
                            value={row.description ?? (p.description || '')}
                            onChange={e => setProductEdits(prev => ({ ...prev, [p.id]: { ...row, description: e.target.value } }))}
                          />
                        </td>

                        <td className="py-2 min-w-[240px]">
                          <input
                            placeholder="https://opensea.io/..."
                            className="w-full dark:bg-gray-800"
                            value={row.nft_url ?? (p.nft_url || (p.metadata?.nft_url || ''))}
                            onChange={e => setProductEdits(prev => ({ ...prev, [p.id]: { ...row, nft_url: e.target.value } }))}
                          />
                        </td>

                        <td className="py-2">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                            onClick={() => saveProductRow(p)}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {products.filter(p => p.division === 'designs').length === 0 && (
                    <tr><td colSpan={9} className="py-6 opacity-70">No products yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 📁 Recent Assets (Designs) — copy + inline edit */}
            <div className="mt-10">
              <h3 className="font-semibold mb-3">Recent Assets (latest 20)</h3>
              {assets?.length ? (
                <div className="glass p-4 rounded">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th>Preview</th>
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
                      {assets
                        .filter(a => a.division === 'designs')
                        .slice(0, 20)
                        .map(a => {
                          const row = assetEdits[a.id] || {};
                          return (
                            <tr key={a.id} className="align-top border-t dark:border-gray-800">
                              <td className="py-2">
                                {a.file_type === 'image'
                                  ? <img src={a.file_url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                                  : a.file_type === 'video' ? '🎞️' : '📄'}
                              </td>
                              <td className="py-2 min-w-[160px]">
                                <input
                                  placeholder={a.filename || '-'}
                                  className="w-full dark:bg-gray-800"
                                  value={row.filename ?? (a.filename || '')}
                                  onChange={e => setAssetEdits(prev => ({ ...prev, [a.id]: { ...row, filename: e.target.value } }))}
                                />
                              </td>
                              <td className="py-2">
                                <select
                                  className="dark:bg-gray-800"
                                  value={row.division ?? (a.division || 'designs')}
                                  onChange={e => setAssetEdits(prev => ({ ...prev, [a.id]: { ...row, division: e.target.value } }))}
                                >
                                  <option value="designs">designs</option>
                                  <option value="publishing">publishing</option>
                                  <option value="capital">capital</option>
                                  <option value="tech">tech</option>
                                  <option value="media">media</option>
                                  <option value="realty">realty</option>
                                  <option value="site">site</option>
                                </select>
                              </td>
                              <td className="py-2">
                                <select
                                  className="dark:bg-gray-800"
                                  value={row.purpose ?? (a.purpose || 'general')}
                                  onChange={e => setAssetEdits(prev => ({ ...prev, [a.id]: { ...row, purpose: e.target.value } }))}
                                >
                                  <option value="general">general</option>
                                  <option value="hero">hero</option>
                                  <option value="carousel">carousel</option>
                                </select>
                              </td>
                              <td className="py-2 min-w-[220px]">
                                <input
                                  placeholder="comma,separated,tags"
                                  className="w-full dark:bg-gray-800"
                                  value={row.tagsStr ?? tagsToCSV(a.tags)}
                                  onChange={e => setAssetEdits(prev => ({ ...prev, [a.id]: { ...row, tagsStr: e.target.value } }))}
                                />
                              </td>
                              <td className="py-2 min-w-[260px]">
                                <textarea
                                  className="w-full h-16 dark:bg-gray-800"
                                  placeholder='{"book":"LOHC","prompt":1}'
                                  value={row.metadataStr ?? JSON.stringify(a.metadata || {}, null, 0)}
                                  onChange={e => setAssetEdits(prev => ({ ...prev, [a.id]: { ...row, metadataStr: e.target.value } }))}
                                />
                              </td>
                              <td className="py-2 max-w-[240px] truncate">
                                {a.file_url}
                              </td>
                              <td className="py-2 space-x-2">
                                <button
                                  className="text-blue-600"
                                  onClick={() => copyText(a.file_url)}
                                  type="button"
                                >
                                  Copy URL
                                </button>
                                <button
                                  className="px-3 py-1 bg-blue-600 text-white rounded"
                                  onClick={() => saveAssetRow(a)}
                                  type="button"
                                >
                                  Save
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {assets.filter(a => a.division === 'designs').length === 0 && (
                        <tr><td colSpan={8} className="py-6 opacity-70">No assets yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="opacity-70">No assets yet.</p>
              )}
            </div>
          </SectionCard>
        )}

        {/* Capital / Tech / Media / Realty — generic */}
        {['capital','tech','media','realty'].includes(activeTab) && (
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
