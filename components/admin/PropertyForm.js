// components/admin/PropertyForm.js
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

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

export default PropertyForm;