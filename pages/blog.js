import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';

export default function Blog({ posts = [] }) {
  const [blogPosts, setBlogPosts] = useState(posts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('id, title, slug, excerpt, created_at, featured_image, content')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const serializedPosts = await Promise.all(
        data.map(async (post) => ({
          ...post,
          mdxContent: await serialize(post.content || ''),
        }))
      );
      setBlogPosts(serializedPosts);
    } catch (error) {
      console.error('Blog fetch error:', error);
      setBlogPosts([
        {
          id: '1',
          title: 'Welcome to Manyagi',
          slug: 'welcome-to-manyagi',
          excerpt: 'An introduction to our multi-division platform.',
          created_at: '2025-09-01T00:00:00Z',
          featured_image: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/og-home.webp',
          mdxContent: await serialize('# Welcome to Manyagi\n\nThis is our first blog post introducing our platform.'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading blog posts...</div>;
  }

  return (
    <>
      <Head>
        <title>Manyagi Blog — Insights & Updates</title>
        <meta name="description" content="Read the latest updates and insights from Manyagi." />
      </Head>
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Manyagi Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <div key={post.id} className="border rounded p-4">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-2">{new Date(post.created_at).toLocaleDateString()}</p>
              <p className="mb-4">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
                Read More
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427852"
          uid="637df68a05"
          title="Subscribe to Blog Updates"
          description="Stay informed with our latest posts and insights."
        />
      </section>

      <Recommender />
    </>
  );
}