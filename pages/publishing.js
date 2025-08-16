import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import Image from 'next/image';

export default function Publishing() {
  const dispatch = useDispatch();

  const handleBundle = () => {
    dispatch(addToCart({ id: 'book1', name: 'Legacy Book', price: 20 }));
    dispatch(addToCart({ id: 'tee1', name: 'Hidden Clans Tee', price: 25 }));
  };

  return (
    <>
      <Head>
        <title>Manyagi Publishing — Novels & Poetry</title>
        <meta name="description" content="Read Chapter 1, join the series list, and get poetry releases." />
        <meta property="og:title" content="Manyagi Publishing — Novels & Poetry" />
        <meta property="og:description" content="Read Chapter 1, join the series list, and get poetry releases." />
        <meta property="og:image" content="https://manyagi.net/images/og-publishing.jpg" />
        <meta property="og:url" content="https://manyagi.net/publishing" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Books & Poetry"
        title="Manyagi Publishing"
        lead="Two novels. A poetry collection. A growing universe: Legacy of the Hidden Clans leads the charge."
      >
        <Link href="/assets/legacy-chapter-1.pdf" target="_blank" rel="noopener noreferrer" className="btn">Read Chapter 1 (PDF)</Link>
        <Link href="#join" className="btn ghost">Get updates</Link>
      </Hero>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card>
          <h3 className="text-2xl mb-2">Legacy of the Hidden Clans</h3>
          <p className="text-muted mb-4">A cinematic saga of power, loyalty, and the unseen forces that bind — Book 1 now in late draft.</p>
          <ul className="text-muted text-sm list-disc pl-5 mb-4">
            <li>24 chapters • 2nd draft complete</li>
            <li>Cover reveal soon</li>
            <li>Audiobook chapters rolling out via Media</li>
          </ul>
          <Link href="/assets/legacy-chapter-1.pdf" target="_blank" rel="noopener noreferrer" className="btn">Download Chapter 1</Link>
          <button onClick={handleBundle} className="btn mt-2">Buy with Free Merch</button>
          <p className="mt-4 text-muted text-sm">Buy the book and get free merch from <Link href="/designs" className="text-accent">Designs</Link>.</p>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Poetry: True Heart</h3>
          <p className="text-muted mb-4">Remastered edition of the original collection. New poems, new commentary, new art prints.</p>
          <ul className="text-muted text-sm list-disc pl-5 mb-4">
            <li>New eBook edition</li>
            <li>Signed print run</li>
            <li>Merch capsule with Designs</li>
          </ul>
          <Link href="#join" className="btn">Join poetry updates</Link>
          <p className="mt-4 text-muted text-sm">Listen to readings on <Link href="/media" className="text-accent">Media</Link>.</p>
        </Card>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Author Bio</h3>
        <p className="text-muted mb-4">Manyagi's founder is a visionary storyteller with roots in African heritage, blending traditional lore with modern narratives.</p>
        <Image src="/images/author-portrait.jpg" alt="Author Portrait" width={400} height={400} className="rounded mb-4" />
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Upcoming Releases</h3>
        <ul className="text-muted text-sm list-disc pl-5">
          <li>Book 2 Teaser: Q4 2025</li>
          <li>Poetry Anthology Vol. 2: 2026</li>
        </ul>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Reader Testimonials</h3>
        <p className="text-muted mb-2">"The world-building in Legacy is unparalleled!" - Reader A</p>
        <p className="text-muted">"True Heart touched my soul." - Reader B</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">FAQ</h3>
        <details className="mb-2">
          <summary className="cursor-pointer">How can I preorder?</summary>
          <p className="text-muted text-sm">Join the list for preorder links.</p>
        </details>
        <details>
          <summary className="cursor-pointer">Are books available in audio?</summary>
          <p className="text-muted text-sm">Yes, via Media division.</p>
        </details>
      </section>
      <section id="join" className="my-10">
        <Card>
          <SubscriptionForm formId="8427848" uid="637df68a01" title="Join the Publishing list" description="Get chapters, cover reveals, and preorder windows first." />
        </Card>
      </section>
    </>
  );
}