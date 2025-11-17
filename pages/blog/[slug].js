// pages/blog/[slug].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import SubscriptionForm from '../../components/SubscriptionForm';
import Recommender from '../../components/Recommender';

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
        if (!res.ok || !data || data.error) {
          throw new Error(data?.error || 'Post not found');
        }

        const mdxContent = await serialize(data.content || '');
        setPost({ ...data, mdxContent });
      } catch (e) {
        console.error('Blog post load error:', e);
        const fallback = {
          id: 'welcome-fallback',
          title: 'Welcome to Manyagi',
          slug: 'site-welcome-to-the-manyagi-universe',
          excerpt: 'An introduction to our multi-division platform.',
          created_at: '2025-09-01T00:00:00Z',
          featured_image: PLACEHOLDER_IMAGE,
          division: 'site',
          mdxContent: await serialize(
            '# Welcome to Manyagi\n\nThis is our first blog post introducing our platform.'
          ),
        };
        setPost(fallback);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading post...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Post not found
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} — Manyagi Blog</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Head>

      {/* Article header */}
      <article className="container mx-auto px-4 pt-14 pb-10">
        <button
          type="button"
          onClick={() => router.push('/blog')}
          className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 hover:underline"
        >
          ← Back to Manyagi Blog
        </button>

        <div className="max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px]">
            {post.category && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                {post.category}
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-100">
              {formatDivision(post.division)}
            </span>
            <span className="text-gray-500">
              {formatDate(post.created_at)} • Manyagi Blog
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base md:text-lg opacity-80 mb-6">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="mb-10 overflow-hidden rounded-3xl border border-gray-100 bg-black/5 shadow-sm dark:border-gray-800">
          <img
            src={post.featured_image || PLACEHOLDER_IMAGE}
            alt={post.title}
            className="h-72 w-full object-cover md:h-96"
          />
        </div>

        <div className="prose max-w-none prose-indigo dark:prose-invert">
          <MDXRemote {...post.mdxContent} />
        </div>
      </article>

      {/* Subscribe */}
      <section
        id="subscribe"
        className="container mx-auto px-4 py-16 border-t border-gray-100 dark:border-gray-800"
      >
        <SubscriptionForm
          formId="8427852"
          uid="637df68a05"
          title="Subscribe to Blog Updates"
          description="Stay informed with new posts, build logs, and playbooks from the Manyagi universe."
        />
      </section>

      <Recommender />
    </>
  );
}
