// components/admin/MediaShowcaseForm.js
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

function MediaShowcaseForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('playlist');

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
        division: 'media',
        metadata: { media_type: mediaType, media_url: mediaUrl || undefined },
      };

      const { error } = await supabase.from('posts').insert(payload);
      if (error) throw error;

      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      setFeaturedImage('');
      setMediaUrl('');
      setMediaType('playlist');
      onCreated?.();
      alert('Media showcase item created.');
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Media — Add Showcase Item (Playlist, Podcast, etc.)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Title (e.g., Manyagi Playlist)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Slug (e.g., manyagi-playlist)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
          className="dark:bg-gray-800"
        >
          <option value="playlist">Playlist</option>
          <option value="podcast">Podcast</option>
          <option value="reel">Reel</option>
          <option value="short">YouTube Short</option>
          <option value="audiobook">Audiobook</option>
        </select>
        <input
          placeholder="Featured Image URL"
          className="md:col-span-2"
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
        />
        <input
          placeholder="Media URL (e.g., YouTube Playlist)"
          className="md:col-span-1"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
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

export default MediaShowcaseForm;