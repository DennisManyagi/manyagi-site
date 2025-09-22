// pages/blog/[slug].js
import { serialize } from 'next-mdx-remote/serialize';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote';

export default function Post({ post }) {
  return <article><MDXRemote {...post.source} /></article>;
}

export async function getStaticPaths() {
  const files = fs.readdirSync(path.join('posts'));
  const paths = files.map(filename => ({ params: { slug: filename.split('.mdx')[0] } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const markdownWithMeta = fs.readFileSync(path.join('posts', params.slug + '.mdx'), 'utf-8');
  const { data: frontMatter, content } = matter(markdownWithMeta);
  const source = await serialize(content);
  return { props: { post: { frontMatter, source } } };
}