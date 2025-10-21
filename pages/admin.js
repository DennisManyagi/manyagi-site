import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
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
} from 'recharts';

// Lazy-load MDX for admin speed
const MDXRemote = dynamic(() => import('next-mdx-remote').then((m) => m.MDXRemote), {
  ssr: false,
});
const mdxSerialize = async (content) =>
  (await import('next-mdx-remote/serialize')).serialize(content || '');

// Utility Functions
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

// UI Components
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

// MultiUploader Component
function MultiUploader({
  division = 'site',
  purpose = 'general',
  fileType = 'image',
  metadata = {},
  onUploaded,
}) {
  const [busy, setBusy] = useState(false);
  const [dndOver, setDndOver] = useState(false);
  const [localPurpose, setLocalPurpose] = useState(purpose);
  const [localDivision, setLocalDivision] = useState(division);
  const [localType, setLocalType] = useState(fileType);

  const uploadFiles = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      for (const file of files) {
        const base64 = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result).split(',')[1] || '');
          r.onerror = reject;
          r.readAsDataURL(file);
        });

        await axios.post(
          '/api/admin/upload-asset',
          {
            file: { data: base64, name: file.name },
            file_type: localType,
            division: localDivision,
            purpose: localPurpose,
            metadata,
          },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
      }

      onUploaded?.();
      alert('Upload complete.');
    } catch (e) {
      alert(`Upload failed: ${e.message}`);
    } finally {
      setBusy(false);
      setDndOver(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDndOver(false);
    const files = [...(e.dataTransfer?.files || [])];
    uploadFiles(files);
  }, []);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDndOver(true);
      }}
      onDragLeave={() => setDndOver(false)}
      onDrop={onDrop}
      className={`rounded border-2 border-dashed p-4 ${
        dndOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-700'
      }`}
    >
      <div className="flex flex-wrap gap-3 mb-3">
        <select
          value={localDivision}
          onChange={(e) => setLocalDivision(e.target.value)}
          className="dark:bg-gray-900"
        >
          {['site', 'publishing', 'designs', 'capital', 'tech', 'media', 'realty'].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={localPurpose}
          onChange={(e) => setLocalPurpose(e.target.value)}
          className="dark:bg-gray-900"
        >
          <option value="general">general</option>
          <option value="hero">hero</option>
          <option value="carousel">carousel</option>
        </select>
        <select
          value={localType}
          onChange={(e) => setLocalType(e.target.value)}
          className="dark:bg-gray-900"
        >
          <option value="image">image</option>
          <option value="video">video</option>
          <option value="pdf">pdf</option>
        </select>
        <label className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 cursor-pointer">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => uploadFiles([...e.target.files])}
          />
          Choose files…
        </label>
      </div>
      <p className="text-sm opacity-80">
        Drag & drop files here (multi-upload supported). They’ll go to{' '}
        <b>{localDivision}</b> / <b>{localPurpose}</b>.
      </p>
      {busy && <p className="mt-2 text-sm">Uploading…</p>}
    </div>
  );
}

// QuickProductForm Component
function QuickProductForm({ defaultDivision = 'designs', onCreated }) {
  const [artFile, setArtFile] = useState(null);
  const [assetUrl, setAssetUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('19.99');
  const [printfulId, setPrintfulId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [metaBook, setMetaBook] = useState('LOHC');
  const [metaSeries, setMetaSeries] = useState('Legacy of the Hidden Clans');
  const [metaPrompt, setMetaPrompt] = useState(1);
  const [metaScene, setMetaScene] = useState('');
  const [metaYear, setMetaYear] = useState(2025);
  const [metaDrop, setMetaDrop] = useState('Drop_1');
  const [purpose, setPurpose] = useState('general');
  const [fileType, setFileType] = useState('image');

  const doUploadAsset = async () => {
    if (!artFile) {
      alert('Choose a file first.');
      return;
    }
    setIsUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(',')[1] || '');
        r.onerror = reject;
        r.readAsDataURL(artFile);
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();
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
          metadata,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data?.error) throw new Error(res.data.error);
      setAssetUrl(res.data.file_url || '');
      alert('Asset uploaded. URL below.');
    } catch (e) {
      alert(`Upload failed: ${e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const doCreateProduct = async () => {
    try {
      if (!title || !price) return alert('Title and price are required.');
      if (!thumbnailUrl) return alert('Provide a thumbnail_url (mockup).');
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
        <div className="md:col-span-3 border rounded p-4 dark:border-gray-700">
          <h3 className="font-semibold mb-2">1) Upload asset (optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <input type="file" onChange={(e) => setArtFile(e.target.files?.[0] || null)} />
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="dark:bg-gray-800"
            >
              <option value="image">image</option>
              <option value="video">video</option>
              <option value="pdf">pdf</option>
            </select>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="dark:bg-gray-800"
            >
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
          {assetUrl && (
            <div className="mt-3 flex items-center gap-2">
              <input value={assetUrl} readOnly className="w-full dark:bg-gray-800" />
              <button
                type="button"
                className="px-3 py-2 bg-blue-600 text-white rounded"
                onClick={() => copyText(assetUrl)}
              >
                Copy
              </button>
            </div>
          )}
        </div>
        <div className="md:col-span-3 border rounded p-4 dark:border-gray-700">
          <h3 className="font-semibold mb-2">2) Create product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              placeholder="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              placeholder="Printful Product ID"
              value={printfulId}
              onChange={(e) => setPrintfulId(e.target.value)}
            />
            <input
              placeholder="thumbnail_url (mockup)"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
            <input
              className="md:col-span-2"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              className="md:col-span-2"
              placeholder="Tags (comma-separated)"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
            />
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={doCreateProduct}
              className="p-2 bg-black text-white rounded dark:bg-gray-700"
            >
              Create Product
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// PublishingProductForm Component
function PublishingProductForm({ onCreated }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('9.99');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tagsStr, setTagsStr] = useState('fantasy, lohc');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [paperbackUrl, setPaperbackUrl] = useState('');
  const [kindleUrl, setKindleUrl] = useState('');
  const [hardcoverUrl, setHardcoverUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [format, setFormat] = useState('ebook');
  const [year, setYear] = useState(2025);
  const [primaryStore, setPrimaryStore] = useState('amazon');

  const uploadCover = async (file) => {
    if (!file) return;
    const base64 = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await axios.post(
      '/api/admin/upload-asset',
      {
        file: { data: base64, name: file.name },
        file_type: 'image',
        division: 'publishing',
        purpose: 'general',
        metadata: { type: 'book_cover', year },
      },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    if (res.data?.file_url) setCoverUrl(res.data.file_url);
  };

  const create = async () => {
    try {
      if (!name) return alert('Title required.');
      if (!coverUrl) return alert('Cover image URL required (upload or paste).');

      const metadata = {
        amazon_url: amazonUrl || undefined,
        paperback_url: paperbackUrl || undefined,
        kindle_url: kindleUrl || undefined,
        hardcover_url: hardcoverUrl || undefined,
        pdf_url: pdfUrl || undefined,
        format,
        year: Number(year),
        primary_store: primaryStore,
      };

      const payload = {
        name,
        price: Number(price || 0),
        division: 'publishing',
        description,
        display_image: coverUrl,
        thumbnail_url: coverUrl,
        status: 'active',
        tags: toArrayTags(tagsStr),
        metadata,
        productType: 'book',
      };

      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;

      setName('');
      setPrice('9.99');
      setDescription('');
      setCoverUrl('');
      setAmazonUrl('');
      setPaperbackUrl('');
      setKindleUrl('');
      setHardcoverUrl('');
      setPdfUrl('');
      setFormat('ebook');
      setYear(2025);
      setTagsStr('');
      setPrimaryStore('amazon');

      onCreated?.();
      alert('Publishing product created.');
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Publishing — Add Book (Amazon links + sample PDF)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Book Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Internal Price (optional)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="ebook">ebook</option>
          <option value="paperback">paperback</option>
          <option value="hardcover">hardcover</option>
        </select>
        <input
          placeholder="Cover Image URL"
          className="md:col-span-2"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
        />
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => uploadCover(e.target.files?.[0])}
          />
          Upload Cover…
        </label>
        <textarea
          className="md:col-span-3"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="md:col-span-3"
          placeholder="Tags (comma-separated)"
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
        />
        <input
          className="md:col-span-3"
          placeholder="Amazon (general product) URL"
          value={amazonUrl}
          onChange={(e) => setAmazonUrl(e.target.value)}
        />
        <input
          placeholder="Amazon Paperback URL"
          value={paperbackUrl}
          onChange={(e) => setPaperbackUrl(e.target.value)}
        />
        <input
          placeholder="Amazon Kindle URL"
          value={kindleUrl}
          onChange={(e) => setKindleUrl(e.target.value)}
        />
        <input
          placeholder="Amazon Hardcover URL"
          value={hardcoverUrl}
          onChange={(e) => setHardcoverUrl(e.target.value)}
        />
        <input
          className="md:col-span-2"
          placeholder="Sample PDF URL (Chapter 1)"
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
        />
        <input
          placeholder="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <div className="md:col-span-3 flex items-center gap-3">
          <label>Primary Store Button:</label>
          <select
            value={primaryStore}
            onChange={(e) => setPrimaryStore(e.target.value)}
            className="dark:bg-gray-900"
          >
            <option value="amazon">Amazon (auto)</option>
            <option value="paperback">Paperback</option>
            <option value="kindle">Kindle</option>
            <option value="hardcover">Hardcover</option>
            <option value="pdf">PDF (sample)</option>
          </select>
          <button
            type="button"
            onClick={create}
            className="ml-auto px-4 py-2 rounded bg-blue-600 text-white"
          >
            Create Book
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

// Main Admin Component
export default function Admin() {
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

        {['capital', 'tech', 'media', 'realty'].includes(activeTab) && (
          <SectionCard title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Division`}>
            <p className="text-sm opacity-80 mb-3">
              Add products for this division (metadata JSON supported). For Realty, we’ll add
              booking + calendar sync in a follow-up module.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="py-2">Name</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Tags</th>
                    <th>Description</th>
                    <th>Metadata JSON</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter((p) => p.division === activeTab)
                    .map((p) => {
                      const row = productEdits[p.id] || {};
                      return (
                        <tr key={p.id} className="border-b dark:border-gray-800 align-top">
                          <td className="py-2">{p.name}</td>
                          <td className="py-2 min-w-[220px]">
                            <input
                              className="w-full dark:bg-gray-800"
                              placeholder="display_image / thumbnail_url"
                              value={row.display_image ?? (p.display_image || p.thumbnail_url || '')}
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
                              placeholder='{"any":"metadata"}'
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
                  {products.filter((p) => p.division === activeTab).length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 opacity-70">
                        No products yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
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
      </div>
    </>
  );
}