// components/admin/TechShowcaseForm.js
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // ✅ client-side Supabase

function parseList(str) {
  return (str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function TechShowcaseForm({
  onCreated,
  editingPost, // optional post to edit
  clearEditing, // callback to exit edit mode
}) {
  const isEditing = Boolean(editingPost?.id);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [description, setDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tagline, setTagline] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [platformsText, setPlatformsText] = useState('');
  const [labelsText, setLabelsText] = useState('');
  const [appCategory, setAppCategory] = useState('flagship'); // 'flagship' | 'upcoming'
  const [appType, setAppType] = useState('app'); // 'app' | 'website'
  const [status, setStatus] = useState('Live'); // UI status badge

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Hydrate form when entering/exiting edit mode
  useEffect(() => {
    if (!editingPost) {
      setTitle('');
      setSlug('');
      setExcerpt('');
      setDescription('');
      setFeaturedImage('');
      setTagline('');
      setAppUrl('');
      setPlatformsText('');
      setLabelsText('');
      setAppCategory('flagship');
      setAppType('app');
      setStatus('Live');
      setError('');
      return;
    }

    const meta = editingPost.metadata || {};

    setTitle(editingPost.title || '');
    setSlug(editingPost.slug || '');
    setExcerpt(editingPost.excerpt || '');
    setDescription(editingPost.content || '');
    setFeaturedImage(editingPost.featured_image || '');
    setTagline(meta.tagline || '');
    setAppUrl(meta.app_url || '');
    setPlatformsText(
      Array.isArray(meta.platforms) ? meta.platforms.join(', ') : ''
    );
    setLabelsText(
      Array.isArray(meta.labels) ? meta.labels.join(', ') : ''
    );
    setAppCategory(meta.app_category || 'flagship');
    setAppType(meta.app_type || 'app');
    setStatus(meta.status || 'Live');
    setError('');
  }, [editingPost]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!title) throw new Error('Title is required');

      const finalSlug =
        slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

      const metadata = {
        app_category: appCategory,
        app_type: appType,
        status,
        app_url: appUrl,
        tagline,
        platforms: parseList(platformsText),
        labels: parseList(labelsText),
      };

      if (isEditing) {
        // UPDATE existing row (keep posts.status as-is)
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            title,
            slug: finalSlug,
            division: 'tech',
            excerpt: excerpt || (description || '').slice(0, 180),
            content: description,
            featured_image: featuredImage,
            metadata,
          })
          .eq('id', editingPost.id)
          .select()
          .single();

        if (updateError) throw updateError;
      } else {
        // INSERT new row with posts.status = 'published'
        const { error: insertError } = await supabase
          .from('posts')
          .insert({
            title,
            slug: finalSlug,
            division: 'tech',
            status: 'published',
            excerpt: excerpt || (description || '').slice(0, 180),
            content: description,
            featured_image: featuredImage,
            metadata,
          })
          .select()
          .single();

        if (insertError) throw insertError;
      }

      onCreated?.();

      if (isEditing) {
        clearEditing?.();
      } else {
        // reset for next create
        setTitle('');
        setSlug('');
        setExcerpt('');
        setDescription('');
        setFeaturedImage('');
        setTagline('');
        setAppUrl('');
        setPlatformsText('');
        setLabelsText('');
        setAppCategory('flagship');
        setAppType('app');
        setStatus('Live');
      }
    } catch (err) {
      console.error('TechShowcaseForm save error', err);
      setError(err.message || 'Failed to save showcase item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="font-semibold">
          {isEditing ? 'Edit Tech Showcase Item' : 'Add Tech Showcase Item'}
        </h3>

        {isEditing && (
          <button
            type="button"
            onClick={clearEditing}
            className="text-xs px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel editing
          </button>
        )}
      </div>

      <p className="text-xs mb-4 opacity-80">
        Use this to add or edit <strong>Daito</strong>, <strong>Nexu</strong>,{' '}
        <strong>RealKenyans</strong>, <strong>Manyagi.net</strong>, and any
        future Manyagi Tech apps. Everything you put here will drive the
        <code> /tech</code> page.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Title + slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Title</label>
            <input
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
              placeholder="Daito — Delivery & Marketplace"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Slug (optional)
            </label>
            <input
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
              placeholder="daito-delivery-app"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Leave blank to auto-generate from the title.
            </p>
          </div>
        </div>

        {/* Tagline + URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Tagline</label>
            <input
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
              placeholder="Buy, sell, and get anything delivered across your city."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              App / Site URL
            </label>
            <input
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
              placeholder="https://daitoapp.net"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Featured image */}
        <div>
          <label className="block text-xs font-semibold mb-1">
            Featured Image URL
          </label>
          <input
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
            placeholder="https://.../daito-screenshot.webp"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Use a Supabase image URL or static <code>/images/...</code> path.
          </p>
        </div>

        {/* Excerpt + description */}
        <div>
          <label className="block text-xs font-semibold mb-1">
            Short Excerpt
          </label>
          <textarea
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 h-16"
            placeholder="One or two sentences that summarize the product."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Full Description
          </label>
          <textarea
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 h-28"
            placeholder="Longer description of what this app does, who it serves, and any key features."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Platforms + labels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Platforms (comma-separated)
            </label>
            <input
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
              placeholder="iOS, Android, Web"
              value={platformsText}
              onChange={(e) => setPlatformsText(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Labels / Tags (comma-separated)
            </label>
            <input
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
              placeholder="Delivery, E-commerce, Logistics"
              value={labelsText}
              onChange={(e) => setLabelsText(e.target.value)}
            />
          </div>
        </div>

        {/* Category + type + status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Category
            </label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
              value={appCategory}
              onChange={(e) => setAppCategory(e.target.value)}
            >
              <option value="flagship">Flagship / Live</option>
              <option value="upcoming">Upcoming / Labs</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Type</label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
              value={appType}
              onChange={(e) => setAppType(e.target.value)}
            >
              <option value="app">App</option>
              <option value="website">Website</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Status</label>
            <select
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Live</option>
              <option>Beta</option>
              <option>Prototype</option>
              <option>In Design</option>
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-blue-600 text-white text-xs font-semibold disabled:opacity-60"
        >
          {saving
            ? isEditing
              ? 'Saving changes…'
              : 'Saving…'
            : isEditing
            ? 'Save Changes'
            : 'Add Showcase Item'}
        </button>
      </form>
    </div>
  );
}
