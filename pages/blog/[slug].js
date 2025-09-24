import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import SubscriptionForm from '../../components/SubscriptionForm';
import Recommender from '../../components/Recommender';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!slug) return; (async () => {
    try {
      const data = await fetch(`/api/posts/${slug}`).then(r => r.json());
      if (!data || data.error) throw new Error('Post not found');
      const mdxContent = await serialize(data.content || '');
      setPost({ ...data, mdxContent });
    } catch (e) {
      const fallback = {
        id: '1',
        title: 'Welcome to Manyagi',
        slug: 'welcome-to-manyagi',
        excerpt: 'An introduction to our multi-division platform.',
        created_at: '2025-09-01T00:00:00Z',
        featured_image: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-home.webp',
        mdxContent: await serialize('# Welcome to Manyagi\n\nThis is our first blog post introducing our platform.'),
      };
      setPost(fallback);
    } finally { setLoading(false); }
  })(); }, [slug]);

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Loading post...</div>;
  if (!post) return <div className="container mx-auto px-4 py-16 text-center">Post not found</div>;

  return (
    <>
      <Head>
        <title>{post.title} — Manyagi Blog</title>
        <meta name="description" content={post.excerpt} />
      </Head>
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-4">{new Date(post.created_at).toLocaleDateString()}</p>
        <img src={post.featured_image} alt={post.title} className="w-full h-64 object-cover rounded mb-6" />
        <div className="prose max-w-none">
          <MDXRemote {...post.mdxContent} />
        </div>
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm formId="8427852" uid="637df68a05" title="Subscribe to Blog Updates" description="Stay informed with our latest posts and insights." />
      </section>

      <Recommender />
    </>
  );
}
