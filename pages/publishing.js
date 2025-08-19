import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import { useState } from 'react';
import Recommender from '../components/Recommender';

export default function Publishing() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  const handleBundle = () => {
    dispatch(addToCart({ id: 'book1', name: 'Legacy Book', price: 20 }));
    dispatch(addToCart({ id: 'tee1', name: 'Hidden Clans Tee', price: 25 }));
    setShowModal(true);
  };

  return (
    <>
      <Head>
        <title>Manyagi Publishing — Novels & Poetry</title>
        <meta name="description" content="Read Chapter 1, join the series list, and get poetry releases." />
        <meta property="og:title" content="Manyagi Publishing — Novels & Poetry" />
        <meta property="og:description" content="Read Chapter 1, join the series list, and get poetry releases." />
        <meta property="og:image" content="https://manyagi.net/images/og-publishing.webp" />
        <meta property="og:url" content="https://manyagi.net/publishing" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Books & Poetry"
        title="Manyagi Publishing"
        lead="Two novels. A poetry collection. A growing universe: Legacy of the Hidden Clans leads the charge."
        carouselImages={['/images/book-carousel-1.webp', '/images/book-carousel-2.webp', '/images/book-carousel-3.webp', '/images/book-carousel-4.webp']}
      >
        <Link href="/assets/Legacy_of_the_Hidden_Clans (Chapter 1)_by D.N. Manyagi.pdf" target="_blank" rel="noopener noreferrer" className="btn">Read Chapter 1 (PDF)</Link>
        <Link href="#join" className="btn ghost">Get updates</Link>
      </Hero>
      <section className="bento-grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card image="/images/legacy-chapter-1.webp" alt="Legacy Book" title="Legacy of the Hidden Clans" description="A cinematic saga of power, loyalty, and the unseen forces that bind — Book 1 now in late draft." category="publishing">
          <ul className="text-muted text-sm list-disc pl-5 mb-4">
            <li>24 chapters • 2nd draft complete</li>
            <li>Cover reveal soon</li>
            <li>Audiobook chapters rolling out via Media</li>
          </ul>
          <Link href="/assets/Legacy_of_the_Hidden_Clans (Chapter 1)_by D.N. Manyagi.pdf" target="_blank" rel="noopener noreferrer" className="btn">Download Chapter 1</Link>
          <button onClick={handleBundle} className="btn mt-2">Buy with Free Merch</button>
          <Link href="https://www.amazon.com/dp/[BOOK_ASIN]" className="btn mt-2">Buy eBook on Amazon</Link>
          <Link href="https://www.audible.com/pd/[AUDIO_ASIN]" className="btn mt-2">Listen on Audible</Link>
          <p className="mt-4 text-muted text-sm">Inspired? Check <Link href="/designs">Designs</Link> for merch or <Link href="/media">Media</Link> for narrations.</p>
        </Card>
        <Card image="/images/author-portrait.webp" alt="Author Portrait" title="True Heart Poetry" description="Emotional poetry collection by D.N. Manyagi, available now." category="publishing">
          <Link href="https://www.amazon.com/dp/[POETRY_ASIN]" className="btn">Buy Poetry eBook</Link>
        </Card>
      </section>
      <section className="division-desc prose max-w-3xl mx-auto text-gray-800">
        <h2 className="text-3xl font-bold mb-6 kinetic">Manyagi Publishing: Stories That Inspire</h2>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Overview</h3>
        <p className="mb-4">Manyagi Publishing is the heart of our empire, crafting immersive narratives in books, poetry, eBooks, and audiobooks. Like HarperCollins, we focus on diverse, inspirational stories that blend fantasy with real-world themes. Our flagship "Legacy of the Hidden Clans" explores power and loyalty, while "Echoes of the Ancestors" delves into heritage. Poetry collections like "True Heart" offer emotional depth.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Products/Services</h3>
        <p className="mb-4">eBooks ($9.99, Amazon link), audiobooks ($19.99, Audible), print books ($24.99, IngramSpark). Free chapters to hook readers. Cross-promote: Scenes inspire Designs merch, narrated in Media videos.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Why Choose Us</h3>
        <p className="mb-4">Unique fantasy worlds, high-quality production, community focus. Readers love the depth and visuals—pair with signals tutorials in Capital for wealth-building stories.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Testimonials</h3>
        <p className="mb-4">"Captivating worlds!" - Reader A. "Emotional poetry!" - Reader B.</p>
        <p className="mt-6"><Link href="/assets/Legacy_of_the_Hidden_Clans (Chapter 1)_by D.N. Manyagi.pdf" className="btn">Download Free Chapter</Link> | <Link href="https://www.amazon.com/dp/[BOOK_ASIN]" className="btn">Buy eBook on Amazon</Link></p>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto glass p-4 rounded">
        <h3 className="text-xl mb-4 kinetic">Latest from @manyagi_publishing</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/manyagi_publishing?ref_src=twsrc%5Etfw">Tweets by manyagi_publishing</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
      {showModal && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center glass">
          <div className="modal-content bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="kinetic">Added to Cart!</h2>
            <p>Legacy Book + Hidden Clans Tee added. Proceed to checkout?</p>
            <Link href="/cart" className="btn">Go to Cart</Link>
            <button onClick={() => setShowModal(false)} className="btn ghost">Continue Shopping</button>
          </div>
        </div>
      )}
      <Recommender />
    </>
  );
}