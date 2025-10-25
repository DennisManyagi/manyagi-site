// components/admin/MediaTab.js
import React from 'react';
import MediaShowcaseForm from '@/components/admin/MediaShowcaseForm';
import SectionCard from '@/components/admin/SectionCard';
import { deleteRow } from '@/lib/adminUtils';

export default function MediaTab({ posts: allPosts, refreshAll }) {
  const mediaPosts = allPosts.filter((p) => p.division === 'media');

  return (
    <SectionCard title="Media Division">
      <MediaShowcaseForm onCreated={refreshAll} />

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Showcase Items (Media)</h3>

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
            {mediaPosts.map((p) => (
              <tr
                key={p.id}
                className="border-b dark:border-gray-800 align-top"
              >
                <td className="py-2">{p.title}</td>
                <td className="py-2">{p.slug}</td>
                <td className="py-2">
                  {p.featured_image ? (
                    <img
                      src={p.featured_image}
                      className="w-16 h-16 object-cover rounded"
                      alt=""
                    />
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-2 min-w-[200px]">
                  <textarea
                    className="w-full h-16 dark:bg-gray-800"
                    value={JSON.stringify(p.metadata || {}, null, 0)}
                    readOnly
                  />
                </td>
                <td className="py-2 space-x-2">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => {
                      /* optional edit later */
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() =>
                      deleteRow(
                        'posts',
                        p.id,
                        refreshAll,
                        'Delete this post?'
                      )
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {mediaPosts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 opacity-70">
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
