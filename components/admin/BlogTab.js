// components/admin/BlogTab.js
import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import SectionCard from '@/components/admin/SectionCard';
import SEO from '@/components/SEO';

// lazy MDX renderer for preview
const MDXRemote = dynamic(
  () => import('next-mdx-remote').then((m) => m.MDXRemote),
  { ssr: false }
);

// simple slug helper so you don't have to type it every time
function slugify(str = '') {
  return str
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogTab({ posts, refreshAll, user }) {
  const [postForm, setPostForm] = useState({
    id: null,
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft',
    division: 'site',
    description: '', // unused here but fine for shared table
    start_date: '',
    end_date: '',
  });

  const [postFilter, setPostFilter] = useState('all');
  const [postQuery, setPostQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [mdx, setMdx] = useState(null);
  const [saving, setSaving] = useState(false);

  // sort newest → oldest, then apply filters/search
  const filteredPosts = useMemo(() => {
    const sorted = [...posts].sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return db - da;
    });

    return sorted
      .filter((p) =>
        postFilter === 'all'
          ? true
          : (p.status || 'draft') ===
            (postFilter === 'draft' ? 'draft' : 'published')
      )
      .filter((p) => {
        if (!postQuery) return true;
        const q = postQuery.toLowerCase();
        return (
          (p.title || '').toLowerCase().includes(q) ||
          (p.slug || '').toLowerCase().includes(q)
        );
      });
  }, [posts, postFilter, postQuery]);

  const clearPostForm = () =>
    setPostForm({
      id: null,
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      status: 'draft',
      division: 'site',
      description: '',
      start_date: '',
      end_date: '',
    });

  const loadPostToForm = (p) => {
    setPostForm({
      id: p.id,
      title: p.title || '',
      slug: p.slug || '',
      excerpt: p.excerpt || '',
      content: p.content || '',
      featured_image: p.featured_image || '',
      status: p.status || 'draft',
      division: p.division || 'site',
      description: p.description || '',
      start_date: p.start_date || '',
      end_date: p.end_date || '',
    });
    setShowPreview(false);
    setMdx(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const savePost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim()) {
      alert('Title is required.');
      return;
    }
    if (!postForm.slug.trim()) {
      alert('Slug is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: postForm.title.trim(),
        slug: postForm.slug.trim(),
        excerpt: postForm.excerpt.trim(),
        content: postForm.content,
        featured_image: postForm.featured_image.trim(),
        status: postForm.status,
        division: postForm.division || 'site',
        author_id: user?.id ?? null,
      };

      if (postForm.id) {
        const { error } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', postForm.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert(payload);
        if (error) throw error;
      }

      clearPostForm();
      refreshAll?.();
      alert('Saved post.');
    } catch (err) {
      alert(`Failed to save post: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const publishToggle = async (id, nextStatus) => {
    const { error } = await supabase
      .from('posts')
      .update({ status: nextStatus })
      .eq('id', id);
    if (error) alert(error.message);
    else refreshAll?.();
  };

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) alert(error.message);
    else {
      if (postForm.id === id) clearPostForm();
      refreshAll?.();
    }
  };

  const doPreview = async () => {
    try {
      const { serialize } = await import('next-mdx-remote/serialize');
      const ser = await serialize(postForm.content || '');
      setMdx(ser);
      setShowPreview(true);
    } catch (err) {
      alert(`MDX parse error: ${err.message}`);
    }
  };

  return (
    <SectionCard title="Blog">
      <SEO
        title="Manyagi Admin - Blog Management"
        description="Manage blog posts for Manyagi divisions."
      />

      {/* filters / search */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <select
          value={postFilter}
          onChange={(e) => setPostFilter(e.target.value)}
          className="p-2 rounded border dark:bg-gray-800"
        >
          <option value="all">All</option>
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
        </select>

        <input
          placeholder="Search title or slug…"
          value={postQuery}
          onChange={(e) => setPostQuery(e.target.value)}
          className="p-2 rounded border flex-1 dark:bg-gray-800"
        />
      </div>

      {/* editor form */}
      <form
        onSubmit={savePost}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded border mb-6 dark:bg-gray-800"
      >
        <input
          placeholder="Title"
          value={postForm.title}
          onChange={(e) =>
            setPostForm({ ...postForm, title: e.target.value })
          }
        />

        <div className="flex gap-2">
          <input
            className="flex-1"
            placeholder="Slug (auto from title or custom)"
            value={postForm.slug}
            onChange={(e) =>
              setPostForm({ ...postForm, slug: e.target.value })
            }
          />
          <button
            type="button"
            onClick={() =>
              setPostForm((prev) => ({
                ...prev,
                slug: prev.slug || slugify(prev.title),
              }))
            }
            className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700"
          >
            Auto
          </button>
        </div>

        <input
          className="col-span-2"
          placeholder="Excerpt"
          value={postForm.excerpt}
          onChange={(e) =>
            setPostForm({ ...postForm, excerpt: e.target.value })
          }
        />

        <input
          className="col-span-2"
          placeholder="Featured Image URL"
          value={postForm.featured_image}
          onChange={(e) =>
            setPostForm({
              ...postForm,
              featured_image: e.target.value,
            })
          }
        />

        <select
          value={postForm.division}
          onChange={(e) =>
            setPostForm({ ...postForm, division: e.target.value })
          }
        >
          {['site', 'publishing', 'designs', 'capital', 'tech', 'media', 'realty'].map(
            (d) => (
              <option key={d} value={d}>
                {d}
              </option>
            )
          )}
        </select>

        <select
          value={postForm.status}
          onChange={(e) =>
            setPostForm({ ...postForm, status: e.target.value })
          }
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <textarea
          className="col-span-2 h-32"
          placeholder="Content (MDX)"
          value={postForm.content}
          onChange={(e) =>
            setPostForm({ ...postForm, content: e.target.value })
          }
        />

        <div className="flex gap-2 flex-wrap">
          <button
            className="p-2 bg-black text-white rounded dark:bg-gray-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Post'}
          </button>

          <button
            type="button"
            onClick={doPreview}
            className="p-2 bg-gray-500 text-white rounded"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={() => {
              clearPostForm();
              setShowPreview(false);
              setMdx(null);
            }}
            className="p-2 bg-red-500 text-white rounded"
          >
            Clear
          </button>
        </div>
      </form>

      {/* preview */}
      {showPreview && mdx && (
        <div className="mb-6 rounded border bg-white p-4 dark:bg-gray-900 dark:border-gray-700">
          <h3 className="text-sm font-semibold mb-2 opacity-70">
            Live MDX Preview
          </h3>
          <div className="prose max-w-none dark:prose-invert">
            <MDXRemote {...mdx} />
          </div>
        </div>
      )}

      {/* posts list */}
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2">Title</th>
            <th className="text-left py-2">Slug</th>
            <th className="text-left py-2">Division</th>
            <th className="text-left py-2">Status</th>
            <th className="text-left py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredPosts.map((p) => (
            <tr
              key={p.id}
              className="border-t dark:border-gray-800 align-top"
            >
              <td className="py-2">{p.title}</td>
              <td className="py-2 text-xs">{p.slug}</td>
              <td className="py-2 text-xs">{p.division || 'site'}</td>
              <td className="py-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    (p.status || 'draft') === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {p.status || 'draft'}
                </span>
              </td>
              <td className="py-2 space-x-3 text-xs">
                <button
                  onClick={() => loadPostToForm(p)}
                  className="text-blue-500"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    publishToggle(
                      p.id,
                      (p.status || 'draft') === 'published'
                        ? 'draft'
                        : 'published'
                    )
                  }
                  className="text-green-600"
                >
                  {(p.status || 'draft') === 'published'
                    ? 'Unpublish'
                    : 'Publish'}
                </button>

                <a
                  href={`/blog/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-600 hover:underline"
                >
                  View
                </a>

                <button
                  onClick={() => deletePost(p.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {filteredPosts.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 opacity-70">
                No posts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </SectionCard>
  );
}
