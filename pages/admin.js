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
  LineChart,
  Line,
  Legend,
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

// QuickProductForm Component (for Designs)
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

// New CapitalProductForm Component
function CapitalProductForm({ onCreated }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('99.99');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tagsStr, setTagsStr] = useState('trading, signals');
  const [licenseType, setLicenseType] = useState('bot');
  const [apiAccess, setApiAccess] = useState(false);
  const [metadataStr, setMetadataStr] = useState('');

  const create = async () => {
    try {
      if (!name) return alert('Title required.');
      if (!price) return alert('Price required.');
      if (!thumbnailUrl) return alert('Thumbnail URL required.');

      const metadata = {
        license_type: licenseType,
        api_access: apiAccess,
        ...(metadataStr ? safeJSON(metadataStr, {}) : {}),
      };

      const payload = {
        name,
        price: Number(price || 0),
        division: 'capital',
        description,
        display_image: thumbnailUrl,
        thumbnail_url: thumbnailUrl,
        status: 'active',
        tags: toArrayTags(tagsStr),
        metadata,
        productType: 'download',
      };

      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;

      setName('');
      setPrice('99.99');
      setDescription('');
      setThumbnailUrl('');
      setTagsStr('trading, signals');
      setLicenseType('bot');
      setApiAccess(false);
      setMetadataStr('');
      onCreated?.();
      alert('Capital product created.');
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Capital — Add Product (Bot License, eBook, etc.)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Product Title (e.g., Trading Bot License)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <select
          value={licenseType}
          onChange={(e) => setLicenseType(e.target.value)}
          className="dark:bg-gray-800"
        >
          <option value="bot">Bot License</option>
          <option value="ebook">eBook</option>
          <option value="course">Course</option>
          <option value="api">API Access</option>
        </select>
        <input
          placeholder="Thumbnail URL"
          className="md:col-span-2"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
        />
        <textarea
          className="md:col-span-3"
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
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={apiAccess}
            onChange={(e) => setApiAccess(e.target.checked)}
          />
          Includes API Access
        </label>
        <textarea
          className="md:col-span-3"
          placeholder='Additional Metadata (JSON, e.g., {"strategy":"mean-reversion"})'
          value={metadataStr}
          onChange={(e) => setMetadataStr(e.target.value)}
        />
        <button
          type="button"
          onClick={create}
          className="md:col-span-3 px-4 py-2 rounded bg-blue-600 text-white"
        >
          Create Capital Product
        </button>
      </div>
    </SectionCard>
  );
}

// New TechShowcaseForm Component
function TechShowcaseForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [appType, setAppType] = useState('app');

  const create = async () => {
    try {
      if (!title) return alert('Title required.');
      if (!slug) return alert('Slug required.');

      const payload = {
        title,
        slug,
        excerpt,
        content,
        featured_image: featuredImage || undefined,
        status: 'published',
        division: 'tech',
        metadata: { app_type: appType, app_url: appUrl || undefined },
      };

      const { error } = await supabase.from('posts').insert(payload);
      if (error) throw error;

      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      setFeaturedImage('');
      setAppUrl('');
      setAppType('app');
      onCreated?.();
      alert('Tech showcase item created.');
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Tech — Add Showcase Item (App/Website)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Title (e.g., Daito App)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Slug (e.g., daito-app)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <select
          value={appType}
          onChange={(e) => setAppType(e.target.value)}
          className="dark:bg-gray-800"
        >
          <option value="app">App</option>
          <option value="website">Website</option>
          <option value="review">Review</option>
        </select>
        <input
          placeholder="Featured Image URL"
          className="md:col-span-2"
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
        />
        <input
          placeholder="App/Website URL"
          className="md:col-span-1"
          value={appUrl}
          onChange={(e) => setAppUrl(e.target.value)}
        />
        <textarea
          className="md:col-span-3"
          placeholder="Excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
        <textarea
          className="md:col-span-3 h-32"
          placeholder="Content (MDX)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="button"
          onClick={create}
          className="md:col-span-3 px-4 py-2 rounded bg-blue-600 text-white"
        >
          Create Showcase Item
        </button>
      </div>
    </SectionCard>
  );
}

// New MediaShowcaseForm Component
function MediaShowcaseForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('playlist');

  const create = async () => {
    try {
      if (!title) return alert('Title required.');
      if (!slug) return alert('Slug required.');

      const payload = {
        title,
        slug,
        excerpt,
        content,
        featured_image: featuredImage || undefined,
        status: 'published',
        division: 'media',
        metadata: { media_type: mediaType, media_url: mediaUrl || undefined },
      };

      const { error } = await supabase.from('posts').insert(payload);
      if (error) throw error;

      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      setFeaturedImage('');
      setMediaUrl('');
      setMediaType('playlist');
      onCreated?.();
      alert('Media showcase item created.');
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Media — Add Showcase Item (Playlist, Podcast, etc.)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Title (e.g., Manyagi Playlist)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Slug (e.g., manyagi-playlist)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
          className="dark:bg-gray-800"
        >
          <option value="playlist">Playlist</option>
          <option value="podcast">Podcast</option>
          <option value="reel">Reel</option>
          <option value="short">YouTube Short</option>
          <option value="audiobook">Audiobook</option>
        </select>
        <input
          placeholder="Featured Image URL"
          className="md:col-span-2"
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
        />
        <input
          placeholder="Media URL (e.g., YouTube Playlist)"
          className="md:col-span-1"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
        />
        <textarea
          className="md:col-span-3"
          placeholder="Excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
        <textarea
          className="md:col-span-3 h-32"
          placeholder="Content (MDX)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="button"
          onClick={create}
          className="md:col-span-3 px-4 py-2 rounded bg-blue-600 text-white"
        >
          Create Showcase Item
        </button>
      </div>
    </SectionCard>
  );
}

// New AffiliatesForm Component
function AffiliatesForm({ onCreated }) {
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [commissionRate, setCommissionRate] = useState('0.1');
  const [metadataStr, setMetadataStr] = useState('');

  const create = async () => {
    try {
      if (!name) return alert('Name required.');
      if (!referralCode) return alert('Referral code required.');

      const payload = {
        name,
        referral_code: referralCode,
        commission_rate: Number(commissionRate),
        status: 'active',
        metadata: metadataStr ? safeJSON(metadataStr, {}) : {},
      };

      const { error } = await supabase.from('affiliates').insert(payload);
      if (error) throw error;

      setName('');
      setReferralCode('');
      setCommissionRate('0.1');
      setMetadataStr('');
      onCreated?.();
      alert('Affiliate created.');
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Affiliates — Add Partner">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Partner Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Referral Code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />
        <input
          placeholder="Commission Rate (e.g., 0.1 for 10%)"
          type="number"
          step="0.01"
          value={commissionRate}
          onChange={(e) => setCommissionRate(e.target.value)}
        />
        <textarea
          className="md:col-span-3"
          placeholder='Metadata (JSON, e.g., {"partner_type":"influencer"})'
          value={metadataStr}
          onChange={(e) => setMetadataStr(e.target.value)}
        />
        <button
          type="button"
          onClick={create}
          className="md:col-span-3 px-4 py-2 rounded bg-blue-600 text-white"
        >
          Create Affiliate
        </button>
      </div>
    </SectionCard>
  );
}

// New BundlesForm Component
function BundlesForm({ products, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('49.99');
  const [productIds, setProductIds] = useState([]);

  const create = async () => {
    try {
      if (!name) return alert('Name required.');
      if (!price) return alert('Price required.');
      if (productIds.length === 0) return alert('Select at least one product.');

      const payload = {
        name,
        description,
        price: Number(price),
        product_ids: productIds,
        status: 'active',
      };

      const { error } = await supabase.from('bundles').insert(payload);
      if (error) throw error;

      setName('');
      setDescription('');
      setPrice('49.99');
      setProductIds([]);
      onCreated?.();
      alert('Bundle created.');
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Bundles — Create Product Bundle">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Bundle Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <select
          multiple
          value={productIds}
          onChange={(e) =>
            setProductIds([...e.target.selectedOptions].map((o) => o.value))
          }
          className="md:col-span-3 h-32 dark:bg-gray-800"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.division})
            </option>
          ))}
        </select>
        <textarea
          className="md:col-span-3"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="button"
          onClick={create}
          className="md:col-span-3 px-4 py-2 rounded bg-blue-600 text-white"
        >
          Create Bundle
        </button>
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

// Added as per patch
function AttachToProperty({ properties, onAfter }) {
  const [propertyId, setPropertyId] = useState('');
  const [urls, setUrls] = useState(''); // newline or comma separated

  const save = async () => {
    if (!propertyId) return alert('Pick a property');
    const list = Array.from(new Set(
      urls.split(/\s|,/).map(s => s.trim()).filter(Boolean)
    ));

    if (list.length === 0) return alert('Add at least one URL');

    // insert into property_images
    const rows = list.map((u, i) => ({
      property_id: propertyId,
      file_url: u,
      file_type: u.match(/\.(mp4)$/i) ? 'video' : 'image',
      position: i,
    }));

    const { error } = await supabase.from('property_images').insert(rows);
    if (error) return alert(error.message);

    setUrls('');
    onAfter?.();
    alert('Attached!');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <select value={propertyId} onChange={e => setPropertyId(e.target.value)} className="dark:bg-gray-800">
        <option value="">Select property</option>
        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <textarea
        className="md:col-span-2 h-24 dark:bg-gray-800"
        placeholder="Paste one URL per line (or comma separated)"
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
      />
      <button onClick={save} className="px-4 py-2 rounded bg-blue-600 text-white">Attach</button>
    </div>
  );
}

// Added as per patch
function RealtyRatesManager({ propertyId }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    nightly_rate: '',
    min_nights: '',
    priority: 0,
    notes: '',
  });
  const load = async () => {
    if (!propertyId) return;
    const r = await fetch(`/api/realty/rates?property_id=${encodeURIComponent(propertyId)}`);
    const j = await r.json();
    setItems(j.items || []);
  };
  useEffect(() => { load(); }, [propertyId]);

  const add = async () => {
    if (!form.start_date || !form.end_date || !form.nightly_rate) {
      alert('Start, end and nightly rate are required');
      return;
    }
    const r = await fetch('/api/realty/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId, ...form }),
    });
    const j = await r.json();
    if (!j.ok) return alert(j.error || 'Failed');
    setForm({ start_date: '', end_date: '', nightly_rate: '', min_nights: '', priority: 0, notes: '' });
    load();
  };
  const delItem = async (id) => {
    if (!confirm('Delete rate?')) return;
    const r = await fetch(`/api/realty/rates?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const j = await r.json();
    if (!j.ok) return alert(j.error || 'Failed');
    load();
  };

  return (
    <div className="mt-6 glass p-4 rounded">
      <h3 className="font-semibold mb-3">Seasonal / Holiday Rates</h3>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <input type="date" value={form.start_date} onChange={(e)=>setForm({...form,start_date:e.target.value})} />
        <input type="date" value={form.end_date} onChange={(e)=>setForm({...form,end_date:e.target.value})} />
        <input type="number" placeholder="Nightly $" value={form.nightly_rate} onChange={(e)=>setForm({...form,nightly_rate:e.target.value})}/>
        <input type="number" placeholder="Min nights" value={form.min_nights} onChange={(e)=>setForm({...form,min_nights:e.target.value})}/>
        <input type="number" placeholder="Priority (higher wins)" value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value})}/>
        <input placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/>
      </div>
      <button className="mt-3 px-3 py-2 rounded bg-blue-600 text-white" onClick={add}>Add Rate</button>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-800">
              <th className="py-2">Dates</th><th>Nightly</th><th>Min</th><th>Priority</th><th>Notes</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id} className="border-b dark:border-gray-900">
                <td className="py-2">{r.start_date} → {r.end_date}</td>
                <td className="py-2">${Number(r.nightly_rate).toFixed(2)}</td>
                <td className="py-2">{r.min_nights ?? '—'}</td>
                <td className="py-2">{r.priority ?? 0}</td>
                <td className="py-2">{r.notes || '—'}</td>
                <td className="py-2">
                  <button className="text-red-600" onClick={()=>delItem(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="py-4 opacity-70">No overrides yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Added as per patch
function PropertyRatesPanel({ properties }) {
  const [selected, setSelected] = useState('');
  return (
    <div className="glass p-4 rounded">
      <div className="flex items-center gap-3 mb-3">
        <select
          className="dark:bg-gray-900"
          value={selected}
          onChange={(e)=>setSelected(e.target.value)}
        >
          <option value="">Select property…</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      {selected ? <RealtyRatesManager propertyId={selected} /> : <p className="opacity-70 text-sm">Choose a property to manage seasonal rates.</p>}
    </div>
  );
}

// Added stub for RealtyTestEmailPanel as per partial
function RealtyTestEmailPanel({ properties }) {
  const [selected, setSelected] = useState('');
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_TEST_EMAIL || '');
  const [busy, setBusy] = useState(false);

  const sendTest = async () => {
    if (!selected) return alert('Select a property');
    if (!email) return alert('Enter an email');
    setBusy(true);
    try {
      const { data } = await axios.post('/api/realty/test-email', { property_id: selected, email });
      alert(data.message || 'Sent!');
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass p-4 rounded">
      <select value={selected} onChange={e => setSelected(e.target.value)} className="dark:bg-gray-800">
        <option value="">Select property</option>
        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Test email" className="dark:bg-gray-800" />
      <button onClick={sendTest} disabled={busy} className="px-4 py-2 rounded bg-blue-600 text-white">
        {busy ? 'Sending...' : 'Send Test Email'}
      </button>
    </div>
  );
}

// Added stub for RealtyTestEmailPanelWithProperty as per partial
function RealtyTestEmailPanelWithProperty() {
  // Assume fetching properties or use context; for stub, empty
  return <RealtyTestEmailPanel properties={[]} />;
}

// NEW: Realty Property Creation Form
function PropertyForm({ onCreated }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('200');
  const [metadataStr, setMetadataStr] = useState('');

  const create = async () => {
    try {
      if (!name || !slug) return alert('Name and slug required.');
      const metadata = safeJSON(metadataStr, {});
      const payload = {
        name,
        slug,
        description,
        price: Number(price || 0),
        division: 'realty',
        status: 'active',
        metadata,
      };
      const { error } = await supabase.from('properties').insert(payload);
      if (error) throw error;
      setName('');
      setSlug('');
      setDescription('');
      setPrice('200');
      setMetadataStr('');
      onCreated?.();
      alert('Property created.');
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Realty — Add Property">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input placeholder="Nightly Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <textarea className="md:col-span-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <textarea className="md:col-span-3" placeholder='Metadata JSON e.g. {"location":"Big Bear, CA", "ical_urls":["https://airbnb.com/ical/xxx"]}' value={metadataStr} onChange={(e) => setMetadataStr(e.target.value)} />
        <button type="button" onClick={create} className="md:col-span-3 px-4 py-2 rounded bg-blue-600 text-white">
          Create Property
        </button>
      </div>
    </SectionCard>
  );
}