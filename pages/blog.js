// pages/blog.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Hero from '../components/Hero';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';

export default function Blog({ posts }) {
  return (
    <>
      <Head>
        <title>Manyagi — Blog</title>
        <meta name="description" content="Read the latest from Manyagi." />
      </Head>
      <Hero
        kicker="Blog"
        title="Our Stories"
        lead="Dive into our latest posts and updates."
        height="h-[500px]"
      >
        <Link href="#posts" className="btn bg-red-600 text-white py-2 px-4 rounded hover:scale-105 transition">
          Read Now
        </Link>
      </Hero>
      <section id="posts" className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        {posts.map((post) => (
          <div key={post.slug} className="card bg-gray-100 rounded p-4">
            <h3 className="text-5xl font-bold mb-2">{post.frontMatter.title}</h3>
            <p className="text-base mb-4">{post.frontMatter.excerpt}</p>
            <MDXRemote {...post.source} />
            <Link href={`/blog/${post.slug}`} className="text-red-600 hover:underline">Read More</Link>
          </div>
        ))}
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-10">
        <SubscriptionForm
          formId="8427635"
          uid="db12290300"
          title="Subscribe to Our Blog"
          description="Get the latest posts delivered to your inbox."
        />
      </section>
    </>
  );
};

export async function getStaticProps() {
  const files = fs.readdirSync(path.join('posts'));
  const posts = await Promise.all(
    files.map(async (filename) => {
      const markdownWithMeta = fs.readFileSync(path.join('posts', filename), 'utf-8');
      const { data: frontMatter, content } = matter(markdownWithMeta);
      const source = await serialize(content);
      return {
        frontMatter,
        source,
        slug: filename.split('.mdx')[0],
      };
    })
  );
  return { props: { posts: posts.sort((a, b) => new Date(b.frontMatter.date) - new Date(a.frontMatter.date)) } };
}