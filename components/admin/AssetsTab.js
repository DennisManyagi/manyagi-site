// components/admin/AssetsTab.js
import React, { useState } from 'react';
import SectionCard from '@/components/admin/SectionCard';
import MultiUploader from '@/components/admin/MultiUploader';
import { toArrayTags, safeJSON, copyText } from '@/lib/adminUtils';

export default function AssetsTab({ assets, refreshAll }) {
  const [assetEdits, setAssetEdits] = useState({});

  const saveAssetRow = async (a) => {
    try {
      const edits = assetEdits[a.id] || {};
      if (!Object.keys(edits).length) return;

      const payload = {
        ...('filename' in edits ? { filename: edits.filename } : {}),
        ...('division' in edits ? { division: edits.division } : {}),
        ...('purpose' in edits ? { purpose: edits.purpose } : {}),
        ...('tagsStr' in edits ? { tags: toArrayTags(edits.tagsStr) } : {}),
        ...('metadataStr' in edits
          ? { metadata: safeJSON(edits.metadataStr, a.metadata || {}) }
          : {}),
      };

      const { error } = await window.supabase
        .from('assets')
        .update(payload)
        .eq('id', a.id);

      if (error) throw error;

      setAssetEdits((prev) => ({ ...prev, [a.id]: {} }));
      refreshAll?.();
      alert('Asset saved.');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Assets Library">
      <p className="text-sm opacity-80 mb-3">
        Upload once, reuse anywhere. Choose division + purpose to route
        files into structured folders in Supabase Storage (e.g.
        <code> designs/hero </code>).
      </p>

      <MultiUploader
        division="site"
        purpose="general"
        fileType="image"
        onUploaded={refreshAll}
      />

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="py-2">Preview</th>
              <th>Filename</th>
              <th>Division</th>
              <th>Purpose</th>
              <th>Tags</th>
              <th>Metadata (JSON)</th>
              <th>URL</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {assets.slice(0, 50).map((a) => {
              const row = assetEdits[a.id] || {};
              return (
                <tr
                  key={a.id}
                  className="align-top border-b dark:border-gray-800"
                >
                  <td className="py-2">
                    {a.file_type === 'image' ? (
                      <img
                        src={a.file_url}
                        className="w-12 h-12 object-cover rounded"
                        alt=""
                      />
                    ) : a.file_type === 'video' ? (
                      '🎞️'
                    ) : (
                      '📄'
                    )}
                  </td>

                  <td className="py-2 min-w-[160px]">
                    <input
                      className="w-full dark:bg-gray-800"
                      placeholder={a.filename || '-'}
                      value={row.filename ?? a.filename ?? ''}
                      onChange={(e) =>
                        setAssetEdits((prev) => ({
                          ...prev,
                          [a.id]: {
                            ...row,
                            filename: e.target.value,
                          },
                        }))
                      }
                    />
                  </td>

                  <td className="py-2">
                    <select
                      className="dark:bg-gray-800"
                      value={row.division ?? a.division ?? 'site'}
                      onChange={(e) =>
                        setAssetEdits((prev) => ({
                          ...prev,
                          [a.id]: {
                            ...row,
                            division: e.target.value,
                          },
                        }))
                      }
                    >
                      {[
                        'site',
                        'publishing',
                        'designs',
                        'capital',
                        'tech',
                        'media',
                        'realty',
                      ].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-2">
                    <select
                      className="dark:bg-gray-800"
                      value={row.purpose ?? a.purpose ?? 'general'}
                      onChange={(e) =>
                        setAssetEdits((prev) => ({
                          ...prev,
                          [a.id]: {
                            ...row,
                            purpose: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="general">general</option>
                      <option value="hero">hero</option>
                      <option value="carousel">carousel</option>
                      <option value="gallery">gallery</option>
                    </select>
                  </td>

                  <td className="py-2 min-w-[200px]">
                    <input
                      className="w-full dark:bg-gray-800"
                      placeholder="comma,separated,tags"
                      value={
                        row.tagsStr ??
                        (Array.isArray(a.tags) ? a.tags.join(', ') : '')
                      }
                      onChange={(e) =>
                        setAssetEdits((prev) => ({
                          ...prev,
                          [a.id]: {
                            ...row,
                            tagsStr: e.target.value,
                          },
                        }))
                      }
                    />
                  </td>

                  <td className="py-2 min-w-[260px]">
                    <textarea
                      className="w-full h-16 dark:bg-gray-800"
                      placeholder='{"scene":"exile-portal"}'
                      value={
                        row.metadataStr ??
                        JSON.stringify(a.metadata || {}, null, 0)
                      }
                      onChange={(e) =>
                        setAssetEdits((prev) => ({
                          ...prev,
                          [a.id]: {
                            ...row,
                            metadataStr: e.target.value,
                          },
                        }))
                      }
                    />
                  </td>

                  <td className="py-2 max-w-[280px] truncate">
                    {a.file_url}
                  </td>

                  <td className="py-2 space-x-2">
                    <button
                      className="text-blue-600 underline"
                      type="button"
                      onClick={() => copyText(a.file_url)}
                    >
                      Copy URL
                    </button>

                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      type="button"
                      onClick={() => saveAssetRow(a)}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}

            {assets.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 opacity-70">
                  No assets yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
