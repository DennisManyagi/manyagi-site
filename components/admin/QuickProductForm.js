// components/admin/QuickProductForm.js
import { useState } from 'react';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import SectionCard from '@/components/admin/SectionCard';
import { toArrayTags, copyText } from '@/lib/adminUtils';

// Derive metadata from tags + title + description + thumbnail/asset
function deriveMetadata({ tags, title, description, thumbnailUrl, assetUrl }) {
  // Tags convention: [BOOKCODE, scene-code, P#, itemtype]
  const bookCode = tags[0] || '';       // e.g. "COLLAPSE"
  const sceneCode = tags[1] || '';      // e.g. "rotunda"
  const promptTag = tags[2] || 'P1';    // e.g. "P1"

  const bookMap = {
    LOHC: 'Legacy of the Hidden Clans',
    SHATTERPOINT: 'Shatterpoint Sky',
    DREAMLESS: 'Dreamless',
    NiceWorld: 'Nice World',
    TW: 'The Wandering',
    CHOICE: 'Choice',
    LAMINA: 'Lamina',
    MAGISCI: 'Magisci',
    COLLAPSE: 'Collapse',
  };

  const promptNumber =
    typeof promptTag === 'string' && promptTag.toUpperCase().startsWith('P')
      ? Number(promptTag.slice(1)) || 1
      : 1;

  const scenePretty = sceneCode ? sceneCode.replace(/-/g, ' ') : '';
  const year = new Date().getFullYear();

  return {
    book: bookCode,                          // e.g. "COLLAPSE"
    series: bookMap[bookCode] || '',         // e.g. "Collapse"
    prompt: promptNumber,                    // e.g. 1
    scene: scenePretty,                      // e.g. "rotunda"
    year,
    drop: `${bookCode || 'GEN'}_P${promptNumber}`, // e.g. "COLLAPSE_P1"
    asset_url: assetUrl || thumbnailUrl || '',
    name: title || '',
    description: description || '',
    tags, // store tags snapshot in metadata as well
  };
}

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

      // Use current tags/title/description to seed asset metadata
      const tags = toArrayTags(tagsStr);
      const metadata = deriveMetadata({
        tags,
        title,
        description,
        thumbnailUrl,
        assetUrl: undefined,
      });

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
      const metadata = deriveMetadata({
        tags,
        title,
        description,
        thumbnailUrl,
        assetUrl,
      });

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
        // NOTE: nft_url column is left null here; you can edit it later in DesignsTab
      };

      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;

      // reset form
      setTitle('');
      setPrice('19.99');
      setPrintfulId('');
      setThumbnailUrl('');
      setDescription('');
      setTagsStr('');
      setArtFile(null);
      setAssetUrl('');

      onCreated?.();
      alert('Product created.');
    } catch (e) {
      alert(`Create product failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Quick Product (Designs) — Upload → Copy URL → Create">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1) Upload asset */}
        <div className="md:col-span-3 border rounded p-4 dark:border-gray-700">
          <h3 className="font-semibold mb-2">1) Upload asset (optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <input
              type="file"
              onChange={(e) => setArtFile(e.target.files?.[0] || null)}
            />
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
              <input
                value={assetUrl}
                readOnly
                className="w-full dark:bg-gray-800"
              />
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

        {/* 2) Create product */}
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
              placeholder="Tags (comma-separated, e.g. COLLAPSE, rotunda, P1, mug)"
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
