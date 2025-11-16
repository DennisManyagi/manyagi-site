// components/admin/TechTab.js
import React, { useState } from 'react';
import TechShowcaseForm from '@/components/admin/TechShowcaseForm';
import SectionCard from '@/components/admin/SectionCard';
import { deleteRow } from '@/lib/adminUtils';

export default function TechTab({ posts: allPosts, refreshAll }) {
  const techPosts = (allPosts || []).filter((p) => p.division === 'tech');
  const [editingPost, setEditingPost] = useState(null);

  return (
    <SectionCard title="Tech Division">
      {/* Create / edit form */}
      <TechShowcaseForm
        onCreated={refreshAll}
        editingPost={editingPost}
        clearEditing={() => setEditingPost(null)}
      />

      {/* Existing showcase items */}
      <div className="mt-8">
        <h3 className="font-semibold mb-3">Showcase Items (Tech)</h3>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="py-2">Title</th>
              <th>Slug</th>
              <th>Category / Type</th>
              <th>URL</th>
              <th>Image</th>
              <th>Metadata JSON</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {techPosts.map((p) => {
              const meta = p.metadata || {};
              return (
                <tr
                  key={p.id}
                  className="border-b dark:border-gray-800 align-top"
                >
                  <td className="py-2 font-semibold">
                    {p.title}
                    {meta.tagline && (
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {meta.tagline}
                      </div>
                    )}
                  </td>

                  <td className="py-2 text-xs text-gray-400">{p.slug}</td>

                  <td className="py-2 text-xs">
                    <div>
                      <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] mr-1">
                        {meta.app_category || 'flagship'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] mr-1">
                        {meta.app_type || 'app'}
                      </span>
                    </div>
                    {meta.status && (
                      <div className="mt-1 text-[11px] text-gray-500">
                        Status: {meta.status}
                      </div>
                    )}
                  </td>

                  <td className="py-2 text-xs max-w-[180px] break-words">
                    {meta.app_url ? (
                      <a
                        href={meta.app_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {meta.app_url}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-2">
                    {p.featured_image ? (
                      <img
                        src={p.featured_image}
                        className="w-16 h-16 object-cover rounded"
                        alt={p.title}
                      />
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-2 min-w-[220px]">
                    <textarea
                      className="w-full h-24 dark:bg-gray-800 text-xs"
                      value={JSON.stringify(meta, null, 2)}
                      readOnly
                    />
                  </td>

                  <td className="py-2 space-y-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded w-full text-xs"
                      onClick={() => {
                        setEditingPost(p);
                        if (typeof window !== 'undefined') {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded w-full text-xs"
                      onClick={() =>
                        deleteRow(
                          'posts',
                          p.id,
                          () => {
                            if (editingPost?.id === p.id) {
                              setEditingPost(null);
                            }
                            refreshAll?.();
                          },
                          'Delete this Tech showcase item?'
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {techPosts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center opacity-70">
                  No showcase items yet. Add Daito, Nexu, RealKenyans, and
                  Manyagi.net above to populate the Tech page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
