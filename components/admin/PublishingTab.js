// components/admin/PublishingTab.js
import React, { useState } from 'react';
import PublishingProductForm from '@/components/admin/PublishingProductForm';
import SectionCard from '@/components/admin/SectionCard';
import {
  toArrayTags,
  safeJSON,
  updateProduct,
  deleteProduct,
} from '@/lib/adminUtils';

export default function PublishingTab({ products: allProducts, refreshAll }) {
  const [edits, setEdits] = useState({});
  const publishingProducts = allProducts.filter(
    (p) => p.division === 'publishing'
  );

  const buildPayload = (row, p) => ({
    ...(row.display_image !== undefined
      ? {
          display_image: row.display_image,
          thumbnail_url: row.display_image,
        }
      : {}),
    ...(row.price !== undefined
      ? { price: parseFloat(row.price || 0) }
      : {}),
    ...(row.description !== undefined ? { description: row.description } : {}),
    ...(row.tagsStr !== undefined
      ? { tags: toArrayTags(row.tagsStr) }
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
              {publishingProducts.map((p) => {
                const row = edits[p.id] || {};
                const prettyMeta = JSON.stringify(p.metadata || {}, null, 0);

                return (
                  <tr
                    key={p.id}
                    className="border-b dark:border-gray-800 align-top"
                  >
                    <td className="py-2">
                      {p.thumbnail_url || p.display_image ? (
                        <img
                          src={p.thumbnail_url || p.display_image}
                          className="w-14 h-14 object-cover rounded"
                          alt=""
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
                          row.display_image ??
                          p.display_image ??
                          p.thumbnail_url ??
                          ''
                        }
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [p.id]: {
                              ...row,
                              display_image: e.target.value,
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
                          setEdits((prev) => ({
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
                        className="w-full h-24 dark:bg-gray-800"
                        value={row.description ?? p.description ?? ''}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [p.id]: { ...row, description: e.target.value },
                          }))
                        }
                      />
                    </td>

                    <td className="py-2 min-w-[360px]">
                      <textarea
                        className="w-full h-24 dark:bg-gray-800"
                        placeholder='{"amazon_url":"…","paperback_url":"…"}'
                        value={row.metadata ?? prettyMeta}
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

              {publishingProducts.length === 0 && (
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
  );
}
