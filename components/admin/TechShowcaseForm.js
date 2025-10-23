// components/admin/TechShowcaseForm.js
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

function TechShowcaseForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [appType, setAppType] = useState('app');

  const create = async () => {
    try {
      if (!title) return alert('Title required.');
      if (!slug) return alert('Slug required.');

      const payload = {
        title,
        slug,
        excerpt,
        content,
        featured_image: featuredImage || undefined,
        status: 'published',
        division: 'tech',
        metadata: { app_type: appType, app_url: appUrl || undefined },
      };

      const { error } = await supabase.from('posts').insert(payload);
      if (error) throw error;

      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      setFeaturedImage('');
      setAppUrl('');
      setAppType('app');
      onCreated?.();
      alert('Tech showcase item created.');
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Tech — Add Showcase Item (App/Website)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Title (e.g., Daito App)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Slug (e.g., daito-app)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <select
          value={appType}
          onChange={(e) => setAppType(e.target.value)}
          className="dark:bg-gray-800"
        >
          <option value="app">App</option>
          <option value="website">Website</option>
          <option value="review">Review</option>
        </select>
        <input
          placeholder="Featured Image URL"
          className="md:col-span-2"
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
        />
        <input
          placeholder="App/Website URL"
          className="md:col-span-1"
          value={appUrl}
          onChange={(e) => setAppUrl(e.target.value)}
        />
        <textarea
          className="md:col-span-3"
          placeholder="Excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
        <textarea
          className="md:col-span-3 h-32"
          placeholder="Content (MDX)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="button"
          onClick={create}
          className="md:col-span-3 px-4 py-2 rounded bg-blue-600 text-white"
        >
          Create Showcase Item
        </button>
      </div>
    </SectionCard>
  );
}

export default TechShowcaseForm;