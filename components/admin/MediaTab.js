// components/admin/MediaTab.js
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import MediaShowcaseForm from '@/components/admin/MediaShowcaseForm';
import SectionCard from '@/components/admin/SectionCard';
import { deleteRow, safeJSON } from '@/lib/adminUtils';

export default function MediaTab({ posts: allPosts, refreshAll }) {
  // only show posts that belong to media division
  const mediaPosts = (allPosts || [])
    .filter((p) => p.division === 'media')
    .sort(
      (a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );

  // local edit state per row: { [post.id]: { ...fieldsBeingEdited } }
  const [edits, setEdits] = useState({});

  // helper to get current editable value (edit override OR db fallback)
  function val(post, key, fallback = '') {
    return edits[post.id]?.[key] ?? post[key] ?? fallback;
  }

  // metadata editor is a string, so we keep a separate key metadataStr in edits
  function metaVal(post) {
    const row = edits[post.id] || {};
    if (row.metadataStr !== undefined) {
      return row.metadataStr;
    }
    return JSON.stringify(post.metadata || {}, null, 0);
  }

  async function save(post) {
    try {
      const row = edits[post.id] || {};
      if (!Object.keys(row).length) return; // nothing changed

      // parse metadata if user touched it
      const newMeta =
        row.metadataStr !== undefined
          ? safeJSON(row.metadataStr, post.metadata || {})
          : undefined;

      // we support both thumbnail_url and featured_image:
      // thumbnail_url is preferred going forward
      // featured_image is legacy, we'll update whichever they edited
      const payload = {
        ...(row.title !== undefined ? { title: row.title } : {}),
        ...(row.slug !== undefined ? { slug: row.slug } : {}),
        ...(row.excerpt !== undefined ? { excerpt: row.excerpt } : {}),
        ...(row.content !== undefined ? { content: row.content } : {}),
        ...(row.thumbnail_url !== undefined
          ? { thumbnail_url: row.thumbnail_url }
          : {}),
        ...(row.featured_image !== undefined
          ? { featured_image: row.featured_image }
          : {}),
        ...(newMeta !== undefined ? { metadata: newMeta } : {}),
      };

      const { error } = await supabase
        .from('posts')
        .update(payload)
        .eq('id', post.id);

      if (error) throw error;

      // clear edits for that row
      setEdits((prev) => ({ ...prev, [post.id]: {} }));
      refreshAll?.();
      alert('Saved.');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  }

  async function remove(postId) {
    if (!confirm('Delete this post?')) return;
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
      refreshAll?.();
      alert('Deleted.');
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  return (
    <SectionCard title="Media Division">
      {/* CREATE NEW MEDIA ITEM */}
      <MediaShowcaseForm onCreated={refreshAll} />

      {/* LIST / EDIT EXISTING MEDIA */}
      <div className="mt-10">
        <h3 className="font-semibold mb-3">Showcase Items (Media)</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b dark:border-gray-700">
                <th className="py-2">Thumb</th>
                <th>Title / Slug</th>
                <th>Excerpt</th>
                <th>Content (MDX)</th>
                <th>Metadata JSON</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {mediaPosts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 opacity-70 text-center"
                  >
                    No showcase items yet.
                  </td>
                </tr>
              ) : (
                mediaPosts.map((p) => {
                  const row = edits[p.id] || {};

                  // pick which image field to show in preview
                  const thumbPreview =
                    row.thumbnail_url ??
                    row.featured_image ??
                    p.thumbnail_url ??
                    p.featured_image ??
                    '';

                  return (
                    <tr
                      key={p.id}
                      className="border-b dark:border-gray-800 align-top"
                    >
                      {/* THUMB / IMAGE FIELDS */}
                      <td className="py-2 min-w-[160px]">
                        <div className="w-16 h-16 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-500 mb-2">
                          {thumbPreview ? (
                            <img
                              src={thumbPreview}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            'no img'
                          )}
                        </div>

                        {/* thumbnail_url (preferred going forward) */}
                        <label className="block text-[10px] opacity-60">
                          thumbnail_url
                        </label>
                        <input
                          className="w-full dark:bg-gray-800 text-[11px] mb-2"
                          placeholder="https://.../hero.webp"
                          value={
                            row.thumbnail_url ??
                            p.thumbnail_url ??
                            ''
                          }
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [p.id]: {
                                ...row,
                                thumbnail_url:
                                  e.target.value,
                              },
                            }))
                          }
                        />

                        {/* featured_image (legacy) */}
                        <label className="block text-[10px] opacity-60">
                          featured_image (legacy)
                        </label>
                        <input
                          className="w-full dark:bg-gray-800 text-[11px]"
                          placeholder="https://.../hero.webp"
                          value={
                            row.featured_image ??
                            p.featured_image ??
                            ''
                          }
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [p.id]: {
                                ...row,
                                featured_image:
                                  e.target.value,
                              },
                            }))
                          }
                        />
                      </td>

                      {/* TITLE / SLUG */}
                      <td className="py-2 min-w-[200px]">
                        <label className="block text-[10px] opacity-60">
                          Title
                        </label>
                        <input
                          className="w-full dark:bg-gray-800 font-semibold"
                          value={val(p, 'title')}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [p.id]: {
                                ...row,
                                title: e.target.value,
                              },
                            }))
                          }
                        />

                        <label className="block text-[10px] opacity-60 mt-2">
                          Slug
                        </label>
                        <input
                          className="w-full dark:bg-gray-800 text-xs"
                          value={val(p, 'slug')}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [p.id]: {
                                ...row,
                                slug: e.target.value,
                              },
                            }))
                          }
                        />
                        <div className="text-[10px] opacity-60">
                          /media/{val(p, 'slug', p.slug)}
                        </div>
                      </td>

                      {/* EXCERPT */}
                      <td className="py-2 min-w-[220px]">
                        <label className="block text-[10px] opacity-60">
                          Excerpt
                        </label>
                        <textarea
                          className="w-full h-24 dark:bg-gray-800 text-[12px]"
                          value={val(p, 'excerpt')}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [p.id]: {
                                ...row,
                                excerpt:
                                  e.target.value,
                              },
                            }))
                          }
                        />
                      </td>

                      {/* CONTENT */}
                      <td className="py-2 min-w-[260px]">
                        <label className="block text-[10px] opacity-60">
                          Content (MDX / long form)
                        </label>
                        <textarea
                          className="w-full h-24 dark:bg-gray-800 text-[11px]"
                          value={val(p, 'content')}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [p.id]: {
                                ...row,
                                content:
                                  e.target.value,
                              },
                            }))
                          }
                        />
                      </td>

                      {/* METADATA */}
                      <td className="py-2 min-w-[260px]">
                        <label className="block text-[10px] opacity-60">
                          Metadata JSON
                        </label>
                        <textarea
                          className="w-full h-24 dark:bg-gray-800 text-[10px]"
                          value={metaVal(p)}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [p.id]: {
                                ...row,
                                metadataStr:
                                  e.target.value,
                              },
                            }))
                          }
                        />
                        <div className="text-[10px] opacity-60 mt-1">
                          e.g. {"{ \"media_type\": \"playlist\", \"media_url\": \"https://youtube.com/...\" }"}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-2 min-w-[120px] space-y-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded w-full text-xs"
                          onClick={() => save(p)}
                        >
                          Save
                        </button>

                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded w-full text-xs"
                          onClick={() => remove(p.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] opacity-60 mt-4 leading-relaxed">
          Tip: After you create/update a media item, you can view it live at
          /media and /media/[slug].
        </p>
      </div>
    </SectionCard>
  );
}
