// components/admin/DesignsTab.js
import React, { useState } from 'react';
import QuickProductForm from '@/components/admin/QuickProductForm';
import SectionCard from '@/components/admin/SectionCard';
import {
  toArrayTags,
  safeJSON,
  updateProduct,
  deleteProduct,
} from '@/lib/adminUtils';

export default function DesignsTab({ products: allProducts, refreshAll }) {
  const [edits, setEdits] = useState({});
  const designsProducts = allProducts.filter(
    (p) => p.division === 'designs'
  );

  const buildPayload = (row, p) => ({
    ...(row.thumbnail_url !== undefined
      ? { thumbnail_url: row.thumbnail_url }
      : {}),
    ...(row.printful_product_id !== undefined
      ? { printful_product_id: row.printful_product_id }
      : {}),
    ...(row.price !== undefined
      ? { price: parseFloat(row.price || 0) }
      : {}),
    ...(row.description !== undefined
      ? { description: row.description }
      : {}),
    ...(row.tagsStr !== undefined
      ? { tags: toArrayTags(row.tagsStr) }
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
              <th>Thumbnail URL</th>
              <th>Tags</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {designsProducts.map((p) => {
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

                  <td className="py-2 min-w-[160px]">
                    <input
                      className="w-full dark:bg-gray-800"
                      placeholder="printful_product_id"
                      value={row.printful_product_id ?? p.printful_product_id ?? ''}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [p.id]: {
                            ...row,
                            printful_product_id: e.target.value,
                          },
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

                  <td className="py-2 min-w-[220px]">
                    <textarea
                      className="w-full h-16 dark:bg-gray-800"
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

            {designsProducts.length === 0 && (
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