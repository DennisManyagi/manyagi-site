// components/admin/PublishingProductForm.js
import { useState } from 'react';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import SectionCard from '@/components/admin/SectionCard';
import { toArrayTags } from '@/lib/adminUtils';

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

export default PublishingProductForm;
