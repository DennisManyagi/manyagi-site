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
      <div className="container mx-auto px-4 py-8">
        {/* Keep your existing JSX UI below — only the data/auth layer above changed */}
      </div>
    </>
  );
}
