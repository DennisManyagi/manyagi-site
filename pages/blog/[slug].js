// pages/blog/[slug].js
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SubscriptionForm from '../../components/SubscriptionForm';
import Recommender from '../../components/Recommender';
import SectionIntro from '../../components/SectionIntro';

const PLACEHOLDER_IMAGE =
  'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-home.webp';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDivision(div) {
  if (!div) return 'Manyagi';
  return div.charAt(0).toUpperCase() + div.slice(1);
}

function getReadingTime(text = '') {
  if (!text.trim()) return '';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

// super lightweight markdown-ish renderer: # / ## / ### => headings, else paragraph
function renderContentBlocks(content = '') {
  const blocks = content.split(/\n\s*\n/); // double newline = new block

  return blocks
    .map((raw, idx) => {
      const text = raw.trim();
      if (!text) return null;

      if (text.startsWith('### ')) {
        return (
          <h3 key={idx} className="mt-6 mb-2 text-lg font-semibold">
            {text.slice(4)}
          </h3>
        );
      }
      if (text.startsWith('## ')) {
        return (
          <h2 key={idx} className="mt-8 mb-3 text-xl font-bold">
            {text.slice(3)}
          </h2>
        );
      }
      if (text.startsWith('# ')) {
        return (
          <h1 key={idx} className="mt-10 mb-4 text-2xl font-bold">
            {text.slice(2)}
          </h1>
        );
      }

      return (
        <p key={idx} className="mb-4 leading-relaxed">
          {text}
        </p>
      );
    })
    .filter(Boolean);
}

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      try {
        const res = await fetch(`/api/posts/${slug}`);
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Post not found');
        }

        setPost(data);
      } catch (e) {
        console.error('Blog post fetch error:', e);

        // Safe fallback article
        setPost({
          id: 'welcome-fallback',
          title: 'Welcome to the Manyagi Universe',
          slug: 'site-welcome-to-the-manyagi-universe',
          excerpt: 'An introduction to our multi-division platform.',
          created_at: '2025-09-01T00:00:00Z',
          featured_image: PLACEHOLDER_IMAGE,
          division: 'site',
          content:
            '# Welcome to the Manyagi Universe\n\nThis is a starter article used when the requested post cannot be loaded.',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading post…
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Post not found.
      </div>
    );
  }

  const metaLineParts = [
    formatDate(post.created_at),
    post.division ? formatDivision(post.division) : null,
    getReadingTime(post.content),
  ].filter(Boolean);

  return (
    <>
      <Head>
        <title>{post.title} — Manyagi Blog</title>
        <meta
          name="description"
          content={post.excerpt || 'Article from the Manyagi Blog.'}
        />
      </Head>

      {/* Editorial-style header using SectionIntro */}
      <SectionIntro
        id="post-header"
        kicker="Manyagi Blog"
        title={post.title}
        lead={post.excerpt || 'A new dispatch from the Manyagi universe.'}
        tone="neutral"
        align="center"
        maxWidth="max-w-3xl"
      >
        {metaLineParts.length > 0 && (
          <p className="mt-3 text-xs md:text-sm text-gray-500">
            {metaLineParts.join(' • ')}
          </p>
        )}
      </SectionIntro>

      {/* Article card */}
      <article className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto rounded-3xl border border-gray-100 bg-white/90 dark:bg-gray-900/90 dark:border-gray-800 shadow-sm px-4 py-6 md:px-8 md:py-8">
          {/* Back link */}
          <div className="mb-4 text-xs">
            <Link
              href="/blog"
              className="inline-flex items-center text-gray-500 hover:text-blue-600"
            >
              ← Back to Blog
            </Link>
          </div>

          {/* Featured image */}
          {post.featured_image && (
            <div className="mb-8 overflow-hidden rounded-2xl bg-black/5">
              <img
                src={post.featured_image || PLACEHOLDER_IMAGE}
                alt={post.title}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose max-w-none prose-sm md:prose-base dark:prose-invert">
            {renderContentBlocks(post.content)}
          </div>
        </div>
      </article>

      {/* Newsletter below article */}
      <section
        id="subscribe"
        className="container mx-auto px-4 pt-0 pb-16"
      >
        <SubscriptionForm
          formId="8427852"
          uid="637df68a05"
          title="Subscribe to Blog Updates"
          description="Weekly playbooks and progress logs from the Manyagi build — no spam, just signal."
        />
      </section>

      <Recommender />
    </>
  );
}
