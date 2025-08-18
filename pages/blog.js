import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import Link from 'next/link';

const components = { h2: (props) => <h2 className="text-2xl mt-6 mb-2" {...props} />, p: (props) => <p className="text-muted mb-4" {...props} /> };

export default function Blog({ posts }) {
  return (
    <>
      <Head>
        <title>Manyagi Blog — Build Logs & Drops</title>
        <meta name="description" content="Empire build logs: publishing progress, merch drops, signals reports, and app updates." />
        <meta property="og:title" content="Manyagi Blog — Build Logs & Drops" />
        <meta property="og:description" content="Empire build logs: publishing progress, merch drops, signals reports, and app updates." />
        <meta property="og:image" content="https://manyagi.net/images/og-blog.jpg" />
        <meta property="og:url" content="https://manyagi.net/blog" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="News & Notes"
        title="Manyagi Blog"
        lead="Transparent progress. Lessons learned. Drop calendars. Weekly signal recaps."
      >
        <Link href="#subscribe" className="btn mt-4 block text-center">Subscribe to Blog</Link>
      </Hero>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        {posts.map((post) => (
          <Card key={post.slug}>
            <h3 className="text-2xl mb-2">{post.frontMatter.title}</h3>
            <p className="text-muted text-sm mb-4">{post.frontMatter.date}</p>
            <MDXRemote {...post.source} components={components} />
          </Card>
        ))}
      </section>
      <section id="subscribe" className="my-10">
        <Card>
          <SubscriptionForm formId="8432549" uid="877716573d" title="Get new posts via email" description="Stay updated with our latest blog entries." />
        </Card>
      </section>
    </>
  );
}

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