// components/admin/DesignsTab.js
import React, { useMemo, useState } from 'react';
import QuickProductForm from '@/components/admin/QuickProductForm';
import SectionCard from '@/components/admin/SectionCard';
import {
  toArrayTags,
  safeJSON,
  updateProduct,
  deleteProduct,
  copyText, // small convenience if you already expose this in adminUtils
} from '@/lib/adminUtils';

export default function DesignsTab({
  products: allProducts,
  assets = [],
  refreshAll,
}) {
  const [edits, setEdits] = useState({});

  const designsProducts = useMemo(
    () => allProducts.filter((p) => p.division === 'designs'),
    [allProducts]
  );

  // Show the latest designs uploads (images) so you can quickly copy & paste URLs
  const recentDesignsAssets = useMemo(
    () =>
      (assets || [])
        .filter((a) => a.division === 'designs' && a.file_type === 'image')
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 30),
    [assets]
  );

  // Build payload; safely merge metadata if nft_url or metadataStr was edited
  const buildPayload = (row, p) => {
    const next = {
      ...(row.thumbnail_url !== undefined
        ? { thumbnail_url: row.thumbnail_url }
        : {}),
      ...(row.printful_product_id !== undefined
        ? { printful_product_id: row.printful_product_id }
        : {}),
      ...(row.price !== undefined ? { price: parseFloat(row.price || 0) } : {}),
      ...(row.description !== undefined ? { description: row.description } : {}),
      ...(row.tagsStr !== undefined ? { tags: toArrayTags(row.tagsStr) } : {}),
    };

    // Merge metadata if needed
    const baseMeta = p.metadata || {};
    let mergedMeta = baseMeta;

    // If user edited the raw JSON field
    if (row.metadataStr !== undefined) {
      mergedMeta = safeJSON(row.metadataStr, baseMeta);
    }

    // If user edited the nft_url field (we set it under metadata.nft_url)
    if (row.nft_url !== undefined) {
      mergedMeta = { ...mergedMeta, nft_url: row.nft_url || '' };
    }

    if (row.metadataStr !== undefined || row.nft_url !== undefined) {
      next.metadata = mergedMeta;
    }

    return next;
  };

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
      {/* Quick create remains as-is */}
      <QuickProductForm defaultDivision="designs" onCreated={refreshAll} />

      {/* NEW: recent uploads for quick copy/paste into thumbnails or product galleries */}
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Recent Designs Uploads</h3>
        <p className="text-xs opacity-70 mb-3">
          Latest image assets uploaded under <code>division=&quot;designs&quot;</code>.
          Click &quot;Copy URL&quot; to paste into a product thumbnail, NFT, or metadata.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b dark:border-gray-700">
                <th className="py-2">Preview</th>
                <th>Filename</th>
                <th>Purpose</th>
                <th>Tags</th>
                <th>URL</th>
                <th>Copy</th>
              </tr>
            </thead>
            <tbody>
              {recentDesignsAssets.length > 0 ? (
                recentDesignsAssets.map((a) => (
                  <tr key={a.id} className="border-b dark:border-gray-800 align-top">
                    <td className="py-2">
                      <img
                        src={a.file_url}
                        className="w-14 h-14 object-cover rounded"
                        alt=""
                      />
                    </td>
                    <td className="py-2">{a.filename || '—'}</td>
                    <td className="py-2">{a.purpose || '—'}</td>
                    <td className="py-2">
                      {Array.isArray(a.tags) && a.tags.length
                        ? a.tags.join(', ')
                        : '—'}
                    </td>
                    <td className="py-2 max-w-[360px] truncate">{a.file_url}</td>
                    <td className="py-2">
                      <button
                        className="text-blue-600 underline"
                        onClick={() => {
                          if (typeof copyText === 'function') copyText(a.file_url);
                          else navigator.clipboard?.writeText?.(a.file_url);
                        }}
                      >
                        Copy URL
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-6 opacity-70" colSpan={6}>
                    No recent design uploads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products editor (Designs) */}
      <div className="mt-10">
        <h3 className="font-semibold mb-3">Products (Designs)</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b dark:border-gray-700">
                <th className="py-2">Thumb</th>
                <th>Name</th>
                <th>Price</th>
                <th>Printful ID</th>
                <th>Thumbnail URL</th>
                <th>NFT URL</th> {/* ✅ NEW column */}
                <th>Tags</th>
                <th>Description</th>
                <th>Metadata (JSON)</th> {/* ✅ NEW: raw JSON editor */}
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {designsProducts.map((p) => {
                const row = edits[p.id] || {};
                const currentNFT =
                  row.nft_url ??
                  (p?.metadata && typeof p.metadata.nft_url === 'string'
                    ? p.metadata.nft_url
                    : '');

                return (
                  <tr key={p.id} className="border-b dark:border-gray-800 align-top">
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

                    {/* ✅ NFT URL editor (saved inside metadata.nft_url) */}
                    <td className="py-2 min-w-[220px]">
                      <input
                        className="w-full dark:bg-gray-800"
                        placeholder="https://opensea.io/assets/... (NFT link)"
                        value={currentNFT}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [p.id]: {
                              ...row,
                              nft_url: e.target.value,
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

                    {/* ✅ Raw metadata editor (optional but handy) */}
                    <td className="py-2 min-w-[280px]">
                      <textarea
                        className="w-full h-20 dark:bg-gray-800"
                        placeholder='{"book":"Nice World","drop":"First Edition"}'
                        value={
                          row.metadataStr ??
                          JSON.stringify(p.metadata || {}, null, 0)
                        }
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [p.id]: {
                              ...row,
                              metadataStr: e.target.value,
                            },
                          }))
                        }
                      />
                      <div className="text-[10px] opacity-60 mt-1">
                        <code>metadata.nft_url</code> is used by the Designs page/card
                        if you want to show a badge or link to the NFT.
                      </div>
                    </td>

                    <td className="py-2 space-x-2 whitespace-nowrap">
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
                  <td colSpan={10} className="py-6 opacity-70">
                    No products yet.
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
