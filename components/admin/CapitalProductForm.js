// components/admin/CapitalProductForm.js
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

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

export default CapitalProductForm;