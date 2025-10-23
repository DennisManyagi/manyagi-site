// components/admin/QuickProductForm.js
import { useState } from 'react';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

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

export default QuickProductForm;