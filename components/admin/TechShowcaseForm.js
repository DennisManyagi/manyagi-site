// components/admin/TechShowcaseForm.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import SectionCard from '@/components/admin/SectionCard';

// helper: turn "Daito App: AI Focus" -> "daito-app-ai-focus"
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove non alphanum / space / dash
    .trim()
    .replace(/\s+/g, '-'); // collapse whitespace to hyphen
}

function TechShowcaseForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [appType, setAppType] = useState('app');

  // NEW: track if user has manually edited slug
  const [slugTouched, setSlugTouched] = useState(false);

  // whenever title changes, if slug has NOT been manually touched yet,
  // keep slug in sync
  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  async function create() {
    try {
      if (!title) return alert('Title required.');
      if (!slug) return alert('Slug required.');

      const payload = {
        title,
        slug,
        excerpt,
        content,
        featured_image: featuredImage || null,
        status: 'published',
        division: 'tech',
        metadata: {
          app_type: appType,
          app_url: appUrl || null,
        },
      };

      const { error } = await supabase.from('posts').insert(payload);
      if (error) throw error;

      // reset form
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      setFeaturedImage('');
      setAppUrl('');
      setAppType('app');
      setSlugTouched(false);

      onCreated?.();
      alert('✅ Tech showcase item created.');
    } catch (e) {
      alert(`❌ Create failed: ${e.message}`);
    }
  }

  return (
    <SectionCard title="Tech — Add Showcase Item (App / Site / Tool)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Title */}
        <input
          placeholder="Title (e.g. Daito App)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="dark:bg-gray-800"
        />

        {/* Slug */}
        <input
          placeholder="Slug (auto or custom)"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true); // lock slug so it won't keep auto-updating
          }}
          className="dark:bg-gray-800"
        />

        {/* App Type */}
        <select
          value={appType}
          onChange={(e) => setAppType(e.target.value)}
          className="dark:bg-gray-800"
        >
          <option value="app">App</option>
          <option value="website">Website</option>
          <option value="review">Review</option>
        </select>

        {/* Featured Image */}
        <input
          placeholder="Featured Image URL (screenshot)"
          className="md:col-span-2 dark:bg-gray-800"
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
        />

        {/* App URL */}
        <input
          placeholder="App/Website URL (App Store, Play Store, etc.)"
          className="md:col-span-1 dark:bg-gray-800"
          value={appUrl}
          onChange={(e) => setAppUrl(e.target.value)}
        />

        {/* Short Excerpt */}
        <textarea
          className="md:col-span-3 dark:bg-gray-800"
          placeholder="Short excerpt (tagline / what this app does)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />

        {/* Long Content */}
        <textarea
          className="md:col-span-3 h-32 dark:bg-gray-800"
          placeholder="Content / Description (optional long text or MDX)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          type="button"
          onClick={create}
          className="md:col-span-3 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Create Showcase Item
        </button>
      </div>
    </SectionCard>
  );
}

export default TechShowcaseForm;
