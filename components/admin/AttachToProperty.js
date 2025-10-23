// components/admin/AttachToProperty.js
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

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

export default AttachToProperty;