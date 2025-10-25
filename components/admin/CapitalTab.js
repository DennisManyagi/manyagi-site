// components/admin/CapitalTab.js
import React, { useState } from 'react';
import CapitalProductForm from '@/components/admin/CapitalProductForm';
import SectionCard from '@/components/admin/SectionCard';
import {
  toArrayTags,
  safeJSON,
  updateProduct,
  deleteProduct,
} from '@/lib/adminUtils';

export default function CapitalTab({ products: allProducts, refreshAll }) {
  const [edits, setEdits] = useState({});
  const capitalProducts = allProducts.filter(
    (p) => p.division === 'capital'
  );

  const buildPayload = (row, p) => ({
    ...(row.thumbnail_url !== undefined
      ? { thumbnail_url: row.thumbnail_url }
      : {}),
    ...(row.price !== undefined
      ? { price: parseFloat(row.price || 0) }
      : {}),
    ...(row.tagsStr !== undefined
      ? { tags: toArrayTags(row.tagsStr) }
      : {}),
    ...(row.description !== undefined
      ? { description: row.description }
      : {}),
    ...(row.metadata !== undefined
      ? { metadata: safeJSON(row.metadata, p.metadata || {}) }
      : {}),
  });

  const save = async (p) => {
    try {
      const row = edits[p.id] || {};
      if (!Object.keys(row).length) return;
      const payload = buildPayload(row, p);
      await updateProduct(p.id, payload);
      setEdits((prev) => ({ ...prev, [p.id]: {} }));
      refreshAll?.();
      alert('Saved.');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  };

  return (
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
            {capitalProducts.map((p) => {
              const row = edits[p.id] || {};
              return (
                <tr
                  key={p.id}
                  className="border-b dark:border-gray-800 align-top"
                >
                  <td className="py-2">
                    {p.thumbnail_url ? (
                      <img
                        src={p.thumbnail_url}
                        className="w-16 h-16 object-cover rounded"
                        alt=""
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
                        setEdits((prev) => ({
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
                      value={row.thumbnail_url ?? p.thumbnail_url ?? ''}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [p.id]: {
                            ...row,
                            thumbnail_url: e.target.value,
                          },
                        }))
                      }
                    />
                  </td>

                  <td className="py-2 min-w-[200px]">
                    <input
                      className="w-full dark:bg-gray-800"
                      placeholder="comma,separated,tags"
                      value={
                        row.tagsStr ??
                        (Array.isArray(p.tags) ? p.tags.join(', ') : '')
                      }
                      onChange={(e) =>
                        setEdits((prev) => ({
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
                      value={row.description ?? p.description ?? ''}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [p.id]: {
                            ...row,
                            description: e.target.value,
                          },
                        }))
                      }
                    />
                  </td>

                  <td className="py-2 min-w-[300px]">
                    <textarea
                      className="w-full h-20 dark:bg-gray-800"
                      placeholder='{"license_type":"bot","api_access":false}'
                      value={
                        row.metadata ??
                        JSON.stringify(p.metadata || {}, null, 0)
                      }
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [p.id]: { ...row, metadata: e.target.value },
                        }))
                      }
                    />
                  </td>

                  <td className="py-2 space-x-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={() => save(p)}
                    >
                      Save
                    </button>

                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      onClick={() => deleteProduct(p.id, refreshAll)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {capitalProducts.length === 0 && (
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
  );
}
