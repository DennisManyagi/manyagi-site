// components/admin/BundlesForm.js
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

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

export default BundlesForm;