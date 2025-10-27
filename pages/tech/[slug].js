// pages/tech/[slug].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const pickImage = (post) =>
  post?.featured_image ||
  post?.thumbnail_url ||
  post?.metadata?.cover_url ||
  '/placeholder.png';

export default function TechDetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch single tech post by slug
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        // NOTE: you have /api/posts right now which returns ALL posts.
        // You’ll want to extend /api/posts to handle ?division=tech&slug=...
        // (We already planned that in the posts.js change.)
        const res = await fetch(`/api/posts?division=tech&slug=${slug}`);
        const json = await res.json();

        // accept a few shapes
        let row = null;
        if (Array.isArray(json)) {
          row = json[0] || null;
        } else if (json.post) {
          row = json.post;
        } else if (json.items) {
          row = json.items[0] || null;
        }

        setPost(row);
      } catch (err) {
        console.error('tech slug fetch error:', err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        Loading…
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16">
        Tech item not found.
      </div>
    );
  }

  const heroImg = pickImage(post);
  const appUrl = post?.metadata?.app_url;
  const appType = post?.metadata?.app_type;

  return (
    <>
      <Head>
        <title>{post.title} — Manyagi Tech</title>
        <meta
          name="description"
          content={post.excerpt || 'Manyagi Tech showcase'}
        />
      </Head>

      <section className="container mx-auto px-4 pb-32 pt-16 md:pb-16 max-w-3xl text-gray-900 dark:text-gray-100">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 text-xs mb-6">
          {appType && (
            <span className="inline-block bg-gray-900 text-white px-2 py-1 rounded font-semibold dark:bg-gray-100 dark:text-gray-900">
              {appType}
            </span>
          )}
          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold dark:bg-blue-900 dark:text-blue-100">
            Manyagi Tech
          </span>
        </div>

        {/* Hero image */}
        <div className="w-full h-64 md:h-[360px] rounded overflow-hidden bg-gray-200 dark:bg-gray-800 mb-6 border border-gray-300 dark:border-gray-700">
          <img
            src={heroImg}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* CTA button */}
        {appUrl && (
          <div className="mb-8">
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 transition dark:bg-yellow-500 dark:text-black dark:hover:bg-yellow-400"
            >
              Visit App
            </a>
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-6 text-lg text-gray-800 dark:text-gray-200">
            {post.excerpt}
          </p>
        )}

        {/* Long content / body */}
        {post.content && (
          <article className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-line">
            {post.content}
          </article>
        )}
      </section>
    </>
  );
}
