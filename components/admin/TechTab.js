// components/admin/TechTab.js
import React from 'react';
import TechShowcaseForm from '@/components/admin/TechShowcaseForm';
import SectionCard from '@/components/admin/SectionCard';
import { deleteRow } from '@/lib/adminUtils';

export default function TechTab({ posts: allPosts, refreshAll }) {
  const techPosts = allPosts.filter((p) => p.division === 'tech');

  return (
    <SectionCard title="Tech Division">
      <TechShowcaseForm onCreated={refreshAll} />

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Showcase Items (Tech)</h3>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="py-2">Title</th>
              <th>Slug</th>
              <th>Image</th>
              <th>Metadata</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {techPosts.map((p) => (
              <tr
                key={p.id}
                className="border-b dark:border-gray-800 align-top"
              >
                <td className="py-2 font-semibold">{p.title}</td>
                <td className="py-2 text-xs text-gray-400">{p.slug}</td>
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
                    className="w-full h-20 dark:bg-gray-800 text-xs"
                    value={JSON.stringify(p.metadata || {}, null, 2)}
                    readOnly
                  />
                </td>
                <td className="py-2 space-y-2">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded w-full text-xs"
                    onClick={() => alert('Edit feature coming soon!')}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded w-full text-xs"
                    onClick={() =>
                      deleteRow(
                        'posts',
                        p.id,
                        refreshAll,
                        'Delete this Tech showcase item?'
                      )
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {techPosts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center opacity-70">
                  No showcase items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
