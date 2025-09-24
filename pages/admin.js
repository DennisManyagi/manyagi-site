import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

const MDXRemote = dynamic(() => import('next-mdx-remote').then(m => m.MDXRemote), { ssr: false });
const mdxSerialize = (content) => import('next-mdx-remote/serialize').then(m => m.serialize(content || ''));

export default function Admin() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [siteConfig, setSiteConfig] = useState({});

  const [newProduct, setNewProduct] = useState({ name: '', price: '', division: 'designs', description: '', image_url: '', status: 'active', metadata: '' });
  const [newAsset, setNewAsset] = useState({ file: null, file_type: 'image', division: 'site', purpose: 'general', metadata: '' });

  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState({ id: null, title: '', slug: '', excerpt: '', content: '', featured_image: '', status: 'draft' });
  const [showPreview, setShowPreview] = useState(false);
  const [mdx, setMdx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }
      setUser(user);

      const { data: userRow } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
      if (userRow?.role !== 'admin') { router.push('/'); return; }
      setIsAdmin(true);

      await refreshAll();
      setLoading(false);
    })();
  }, [router]);

  const refreshAll = async () => {
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
    setSiteConfig((c.data || []).reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}));
    setPosts(b.data || []);
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
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* PRODUCTS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Products</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded border mb-6">
            <input className="p-2 border rounded" placeholder="Name" value={newProduct.name} onChange={(e)=>setNewProduct(p=>({...p, name:e.target.value}))}/>
            <input className="p-2 border rounded" placeholder="Price" type="number" step="0.01" value={newProduct.price} onChange={(e)=>setNewProduct(p=>({...p, price:e.target.value}))}/>
            <select className="p-2 border rounded" value={newProduct.division} onChange={(e)=>setNewProduct(p=>({...p, division:e.target.value}))}>
              <option value="designs">designs</option>
              <option value="publishing">publishing</option>
              <option value="media">media</option>
              <option value="capital">capital</option>
              <option value="tech">tech</option>
              <option value="realty">realty</option>
            </select>
            <input className="p-2 border rounded col-span-1 md:col-span-3" placeholder="Image URL" value={newProduct.image_url} onChange={(e)=>setNewProduct(p=>({...p, image_url:e.target.value}))}/>
            <textarea className="p-2 border rounded col-span-1 md:col-span-3" placeholder="Description" value={newProduct.description} onChange={(e)=>setNewProduct(p=>({...p, description:e.target.value}))}/>
            <select className="p-2 border rounded" value={newProduct.status} onChange={(e)=>setNewProduct(p=>({...p, status:e.target.value}))}>
              <option value="active">active</option>
              <option value="draft">draft</option>
            </select>
            <input className="p-2 border rounded col-span-1 md:col-span-2" placeholder='Metadata JSON (e.g. {"amazon_url":"..."})' value={newProduct.metadata} onChange={(e)=>setNewProduct(p=>({...p, metadata:e.target.value}))}/>
            <button className="p-2 bg-black text-white rounded">Add Product</button>
          </form>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Name</th>
                  <th>Division</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p=>(
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.name}</td>
                    <td>{p.division}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.status}</td>
                    <td className="truncate max-w-[240px]">{p.image_url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ASSETS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Assets</h2>
          <form onSubmit={handleUploadAsset} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded border mb-6">
            <input type="file" onChange={(e)=>setNewAsset(a=>({...a, file:e.target.files?.[0]||null}))} className="p-2 border rounded col-span-1 md:col-span-2" />
            <select className="p-2 border rounded" value={newAsset.file_type} onChange={(e)=>setNewAsset(a=>({...a, file_type:e.target.value}))}>
              <option value="image">image</option>
              <option value="video">video</option>
              <option value="pdf">pdf</option>
            </select>
            <select className="p-2 border rounded" value={newAsset.division} onChange={(e)=>setNewAsset(a=>({...a, division:e.target.value}))}>
              <option value="site">site</option>
              <option value="publishing">publishing</option>
              <option value="designs">designs</option>
              <option value="capital">capital</option>
              <option value="tech">tech</option>
              <option value="media">media</option>
              <option value="realty">realty</option>
            </select>
            <select className="p-2 border rounded" value={newAsset.purpose} onChange={(e)=>setNewAsset(a=>({...a, purpose:e.target.value}))}>
              <option value="general">general</option>
              <option value="hero">hero</option>
              <option value="logo">logo</option>
              <option value="favicon">favicon</option>
              <option value="carousel">carousel</option>
            </select>
            <input className="p-2 border rounded col-span-1 md:col-span-4" placeholder='Metadata JSON' value={newAsset.metadata} onChange={(e)=>setNewAsset(a=>({...a, metadata:e.target.value}))}/>
            <button className="p-2 bg-black text-white rounded">Upload</button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assets.map(a=>(
              <div key={a.id} className="border rounded p-3">
                <div className="text-sm mb-2"><strong>{a.file_type}</strong> • {a.division} • {a.purpose}</div>
                <a className="text-blue-600 break-all" href={a.file_url} target="_blank" rel="noopener noreferrer">{a.file_url}</a>
              </div>
            ))}
          </div>
        </section>

        {/* POSTS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Posts</h2>
          <form onSubmit={savePost} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded border mb-6">
            <input className="p-2 border rounded" placeholder="Title" value={postForm.title} onChange={(e)=>setPostForm(f=>({...f, title:e.target.value}))}/>
            <input className="p-2 border rounded" placeholder="Slug" value={postForm.slug} onChange={(e)=>setPostForm(f=>({...f, slug:e.target.value}))}/>
            <input className="p-2 border rounded md:col-span-2" placeholder="Featured Image URL" value={postForm.featured_image} onChange={(e)=>setPostForm(f=>({...f, featured_image:e.target.value}))}/>
            <textarea className="p-2 border rounded md:col-span-2" rows={3} placeholder="Excerpt" value={postForm.excerpt} onChange={(e)=>setPostForm(f=>({...f, excerpt:e.target.value}))}/>
            <textarea className="p-2 border rounded md:col-span-2" rows={8} placeholder="MDX Content" value={postForm.content} onChange={(e)=>setPostForm(f=>({...f, content:e.target.value}))}/>
            <div className="flex items-center gap-2">
              <select className="p-2 border rounded" value={postForm.status} onChange={(e)=>setPostForm(f=>({...f, status:e.target.value}))}>
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
              <button type="button" onClick={doPreview} className="p-2 border rounded">Preview</button>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-black text-white rounded">{postForm.id ? 'Update' : 'Create'} Post</button>
              {postForm.id && <button type="button" onClick={clearPostForm} className="p-2 border rounded">Clear</button>}
            </div>
          </form>

          {showPreview && mdx && (
            <div className="border rounded p-4 mb-6">
              <h3 className="font-semibold mb-2">Preview</h3>
              <MDXRemote {...mdx} />
            </div>
          )}

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p=>(
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.title}</td>
                    <td>{p.slug}</td>
                    <td>{p.status}</td>
                    <td className="space-x-2">
                      <button onClick={()=>loadPostToForm(p)} className="text-blue-600">Edit</button>
                      <button onClick={()=>publishToggle(p.id, p.status === 'published' ? 'draft' : 'published')} className="text-yellow-600">
                        {p.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={()=>deletePost(p.id)} className="text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ORDERS & SUBSCRIPTIONS (read-only quick view) */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Orders (latest)</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">ID</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Type</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0,20).map(o=>(
                  <tr key={o.id} className="border-b">
                    <td className="py-2">{o.id}</td>
                    <td>{o.status}</td>
                    <td>${Number(o.total_amount).toFixed(2)}</td>
                    <td>{o.type}</td>
                    <td>{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Subscriptions (latest)</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Stripe Sub ID</th>
                  <th>Telegram</th>
                  <th>Status</th>
                  <th>Period End</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.slice(0,20).map(s=>(
                  <tr key={s.id} className="border-b">
                    <td className="py-2">{s.stripe_subscription_id || '—'}</td>
                    <td>{s.telegram_id || '—'}</td>
                    <td>{s.status}</td>
                    <td>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SITE CONFIG quick glance */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Site Config</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">{JSON.stringify(siteConfig, null, 2)}</pre>
        </section>
      </div>
    </>
  );
}
