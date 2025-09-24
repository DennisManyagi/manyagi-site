import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { supabase } from '@/lib/supabase';                // <-- anon client for browser
import { createServerClient } from '@/lib/supabase';       // your helper for auth.getUser() on the client

// Lazy MDX preview (optional). If you don't want preview, you can remove these two lines and the Preview panel.
const MDXRemote = dynamic(() => import('next-mdx-remote').then(m => m.MDXRemote), { ssr: false });
const mdxSerialize = (content) => import('next-mdx-remote/serialize').then(m => m.serialize(content || ''));

export default function Admin() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data buckets
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [siteConfig, setSiteConfig] = useState({});

  // Forms
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', division: 'designs', description: '', image_url: '', status: 'active', metadata: ''
  });

  const [newAsset, setNewAsset] = useState({
    file: null, file_type: 'image', division: 'site', purpose: 'general', metadata: ''
  });

  // Blog state
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState({
    id: null,
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [mdx, setMdx] = useState(null);

  const [loading, setLoading] = useState(true);

  // ---------- AUTH CHECK ----------
  useEffect(() => {
    (async () => {
      const sc = createServerClient();
      const { data: { user } } = await sc.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);

      // check admin role with RLS-safe call
      const { data: userRow } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (userRow?.role !== 'admin') {
        router.push('/');
        return;
      }
      setIsAdmin(true);

      await refreshAll();
      setLoading(false);
    })();
  }, [router]);

  // ---------- LOAD EVERYTHING ----------
  const refreshAll = async () => {
    // all reads using anon client under the admin session
    const [p, o, s, a, c, b] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
      supabase.from('assets').select('*').order('created_at', { ascending: false }),
      supabase.from('site_config').select('*'),
      supabase.from('posts').select('*').order('created_at', { ascending: false }),
    ]);

    setProducts(p.data || []);
    setOrders(o.data || []);
    setSubscriptions(s.data || []);
    setAssets(a.data || []);

    const cfg = (c.data || []).reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
    setSiteConfig(cfg);

    setPosts(b.data || []);
  };

  // ---------- PRODUCTS ----------
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        metadata: newProduct.metadata ? JSON.parse(newProduct.metadata) : {}
      };
      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;
      setNewProduct({ name: '', price: '', division: 'designs', description: '', image_url: '', status: 'active', metadata: '' });
      await refreshAll();
      alert('Product added.');
    } catch (err) {
      alert(`Failed to add product: ${err.message}`);
    }
  };

  // ---------- ASSETS ----------
  const handleUploadAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.file) {
      alert('Please select a file');
      return;
    }

    try {
      // Upload into Supabase Storage directly from the browser.
      // Bucket: assets / path: auto folder per type
      const ext = newAsset.file.name.split('.').pop();
      const stamp = Date.now();
      const folder = newAsset.file_type === 'image' ? 'images' :
                     newAsset.file_type === 'video' ? 'videos' : 'pdfs';
      const path = `${folder}/${stamp}-${newAsset.file.name}`;

      const { error: upErr } = await supabase.storage.from('assets').upload(path, newAsset.file, {
        upsert: false
      });
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

      // Update site_config for special purposes
      if (['hero', 'logo', 'favicon'].includes(newAsset.purpose)) {
        await supabase.from('site_config').upsert({
          key: newAsset.purpose,
          value: { file_url }
        });
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

  const handleDeleteAsset = async (assetId) => {
    if (!confirm('Delete this asset?')) return;
    try {
      // (Optional) also delete from storage if you track path. Here we only delete DB row.
      const { error } = await supabase.from('assets').delete().eq('id', assetId);
      if (error) throw error;
      await refreshAll();
      alert('Asset deleted.');
    } catch (err) {
      alert(`Failed to delete asset: ${err.message}`);
    }
  };

  // ---------- BLOG (posts) ----------
  const loadPostToForm = async (p) => {
    setPostForm({
      id: p.id,
      title: p.title || '',
      slug: p.slug || '',
      excerpt: p.excerpt || '',
      content: p.content || '',
      featured_image: p.featured_image || '',
      status: p.status || 'draft'
    });
    setShowPreview(false);
    setMdx(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearPostForm = () => {
    setPostForm({
      id: null,
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      status: 'draft'
    });
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
        author_id: user.id
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
    try {
      const { error } = await supabase.from('posts').update({ status: nextStatus }).eq('id', postId);
      if (error) throw error;
      await refreshAll();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      if (postForm.id === postId) clearPostForm();
      await refreshAll();
    } catch (err) {
      alert(`Failed to delete post: ${err.message}`);
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

  if (loading) return <p className="p-6">Loading admin dashboard…</p>;
  if (!isAdmin) return <p className="p-6">Not authorized.</p>;

  return (
    <>
      <Head><title>Manyagi Admin Dashboard</title></Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="mb-6">Welcome, {user?.email}</p>
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">← Back to Site</Link>

        {/* BLOG MANAGER */}
        <section className="mb-10 p-6 border rounded">
          <h2 className="text-2xl font-bold mb-4">Blog — Create / Edit Post</h2>
          <form onSubmit={savePost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full p-2 border rounded"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Slug (e.g., my-first-post)"
                className="w-full p-2 border rounded"
                value={postForm.slug}
                onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Featured Image URL (optional)"
                className="w-full p-2 border rounded"
                value={postForm.featured_image}
                onChange={(e) => setPostForm({ ...postForm, featured_image: e.target.value })}
              />
              <select
                className="w-full p-2 border rounded"
                value={postForm.status}
                onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <textarea
              placeholder="Excerpt (optional)"
              className="w-full p-2 border rounded"
              value={postForm.excerpt}
              onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
              rows={3}
            />

            <div>
              <label className="block text-sm mb-1">Content (MDX)</label>
              <textarea
                placeholder="Write your MDX here…"
                className="w-full p-2 border rounded font-mono"
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                rows={12}
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                {postForm.id ? 'Update Post' : 'Create Post'}
              </button>
              {postForm.id && (
                <button
                  type="button"
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded"
                  onClick={clearPostForm}
                >
                  New Post
                </button>
              )}
              <button
                type="button"
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                onClick={doPreview}
              >
                Preview
              </button>
            </div>

            {showPreview && mdx && (
              <div className="mt-6 p-4 border rounded">
                <h3 className="font-semibold mb-2">Preview</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="prose max-w-none">
                  <MDXRemote {...mdx} />
                </div>
              </div>
            )}
          </form>
        </section>

        <section className="mb-10 p-6 border rounded">
          <h3 className="text-xl font-bold mb-4">Posts ({posts.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((p) => (
              <div key={p.id} className="p-3 border rounded flex flex-col gap-2">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-xs text-gray-600">/{p.slug}</div>
                    <div className="text-xs">Status: <span className="font-medium">{p.status}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 text-sm underline"
                      onClick={() => loadPostToForm(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 text-sm underline"
                      onClick={() => deletePost(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {p.status === 'published' ? (
                    <button
                      className="bg-yellow-500 text-white text-sm px-3 py-1 rounded"
                      onClick={() => publishToggle(p.id, 'draft')}
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      className="bg-green-600 text-white text-sm px-3 py-1 rounded"
                      onClick={() => publishToggle(p.id, 'published')}
                    >
                      Publish
                    </button>
                  )}
                  <Link
                    href={`/blog/${p.slug}`}
                    className="text-sm px-3 py-1 rounded border"
                    target="_blank"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ADD PRODUCT */}
        <section className="mb-10 p-6 border rounded">
          <h2 className="text-2xl font-bold mb-4">Add Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Product Name"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              placeholder="Price"
              className="w-full p-2 border rounded"
              required
            />
            <select
              value={newProduct.division}
              onChange={(e) => setNewProduct({ ...newProduct, division: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="designs">Designs</option>
              <option value="publishing">Publishing</option>
              <option value="capital">Capital</option>
              <option value="realty">Realty</option>
              <option value="tech">Tech</option>
              <option value="media">Media</option>
            </select>
            <textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              placeholder="Description"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              value={newProduct.image_url}
              onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
              placeholder="Image URL"
              className="w-full p-2 border rounded"
            />
            <select
              value={newProduct.status}
              onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <input
              type="text"
              value={newProduct.metadata}
              onChange={(e) => setNewProduct({ ...newProduct, metadata: e.target.value })}
              placeholder='Metadata JSON (e.g. {"color":"Black"})'
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Add Product
            </button>
          </form>
        </section>

        {/* UPLOAD ASSET */}
        <section className="mb-10 p-6 border rounded">
          <h2 className="text-2xl font-bold mb-4">Upload Asset</h2>
          <form onSubmit={handleUploadAsset} className="space-y-4">
            <input
              type="file"
              accept="image/*,video/*,.pdf"
              onChange={(e) => setNewAsset({ ...newAsset, file: e.target.files?.[0] || null })}
              className="w-full p-2 border rounded"
              required
            />
            <select
              value={newAsset.file_type}
              onChange={(e) => setNewAsset({ ...newAsset, file_type: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
            </select>
            <select
              value={newAsset.division}
              onChange={(e) => setNewAsset({ ...newAsset, division: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="site">Site</option>
              <option value="designs">Designs</option>
              <option value="publishing">Publishing</option>
              <option value="capital">Capital</option>
              <option value="realty">Realty</option>
              <option value="tech">Tech</option>
              <option value="media">Media</option>
            </select>
            <select
              value={newAsset.purpose}
              onChange={(e) => setNewAsset({ ...newAsset, purpose: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="general">General</option>
              <option value="hero">Hero Image</option>
              <option value="logo">Logo</option>
              <option value="favicon">Favicon</option>
              <option value="product">Product Image</option>
              <option value="carousel">Carousel Image</option>
              <option value="og">Open Graph</option>
            </select>
            <input
              type="text"
              value={newAsset.metadata}
              onChange={(e) => setNewAsset({ ...newAsset, metadata: e.target.value })}
              placeholder='Metadata JSON (e.g. {"page":"home"})'
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              Upload Asset
            </button>
          </form>
        </section>

        {/* SITE CONFIG */}
        <section className="mb-10 p-6 border rounded">
          <h2 className="text-2xl font-bold mb-4">Site Configuration (read-only)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>Logo:</strong> {siteConfig.logo?.file_url || 'Not set'}</div>
            <div><strong>Favicon:</strong> {siteConfig.favicon?.file_url || 'Not set'}</div>
            <div><strong>Hero:</strong> {siteConfig.hero?.file_url || 'Not set'}</div>
            <div className="col-span-2">
              <strong>Carousel Images:</strong><br />
              {Array.isArray(siteConfig.carousel_images) ? siteConfig.carousel_images.join(', ') : 'None set'}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Uploading with purpose <code>logo</code>, <code>favicon</code>, <code>hero</code>, or <code>carousel</code> will automatically upsert these keys.
          </p>
        </section>

        {/* LISTS */}
        <section className="mb-10 p-6 border rounded">
          <h2 className="text-2xl font-bold mb-4">Products ({products.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product.id} className="p-3 border rounded">
                <strong>{product.name}</strong> — ${product.price}
                <div className="text-sm">Division: {product.division} | Status: {product.status}</div>
                <div className="text-xs text-gray-600">{product.description}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 p-6 border rounded">
          <h2 className="text-2xl font-bold mb-4">Orders ({orders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.slice(0, 12).map((o) => (
              <div key={o.id} className="p-3 border rounded">
                <div><strong>${o.total_amount}</strong> — {o.status}</div>
                <div className="text-sm">Division: {o.division}</div>
                <div className="text-xs">Items: {Array.isArray(o.items) ? o.items.length : 0}</div>
                <div className="text-xs text-gray-600">Stripe: {o.stripe_session_id || '-'}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 p-6 border rounded">
          <h2 className="text-2xl font-bold mb-4">Subscriptions ({subscriptions.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((s) => (
              <div key={s.id} className="p-3 border rounded">
                <strong>{s.plan_type}</strong> — {s.status}
                <div className="text-sm">Division: {s.division}</div>
                <div className="text-xs">Telegram: {s.telegram_id || 'N/A'}</div>
                <div className="text-xs">Period: {s.current_period_start} → {s.current_period_end}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 border rounded">
          <h2 className="text-2xl font-bold mb-4">Assets ({assets.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="p-3 border rounded flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{asset.purpose}</div>
                  <div className="text-sm">Division: {asset.division} | Type: {asset.file_type}</div>
                  <div className="text-xs break-all">{asset.file_url}</div>
                </div>
                <button
                  onClick={() => handleDeleteAsset(asset.id)}
                  className="text-red-600 text-sm underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
