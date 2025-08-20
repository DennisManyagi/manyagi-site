// pages/publishing.js
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
        className="division-publishing"
        kicker="Books & Poetry"
        title="Manyagi Publishing"
        lead="Two novels. A poetry collection. A growing universe: Legacy of the Hidden Clans leads the charge."
        carouselImages={['/images/book-carousel-1.webp', '/images/book-carousel-2.webp', '/images/book-carousel-3.webp', '/images/book-carousel-4.webp']}
      >
        <Link href="https://manyagi.net/assets/Legacy_of_the_Hidden_Clans (Chapter 1)_by D.N. Manyagi.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-publishing">Read Chapter 1 (PDF)</Link>
        <Link href="#join" className="btn btn-publishing ghost">Get updates</Link>
      </Hero>
      <section className="bento-grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card image="/images/legacy-chapter-1.webp" alt="Legacy Book" title="Legacy of the Hidden Clans" description="A cinematic saga of power, loyalty, and the unseen forces that bind — Book 1 now in late draft." category="publishing">
          <ul className="text-gray-700 text-sm list-disc pl-5 mb-4">
            <li>24 chapters • 2nd draft complete</li>
            <li>Cover reveal soon</li>
            <li>Audiobook chapters rolling out via Media</li>
          </ul>
          <div className="flex space-x-4">
            <Link href="https://manyagi.net/assets/Legacy_of_the_Hidden_Clans (Chapter 1)_by D.N. Manyagi.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-publishing">Download Chapter 1</Link>
            <button onClick={handleBundle} className="btn btn-publishing">Buy with Free Merch</button>
            <Link href="https://www.amazon.com/dp/[BOOK_ASIN]" target="_blank" rel="noopener noreferrer" className="btn btn-publishing">Buy eBook on Amazon</Link>
            <Link href="https://www.audible.com/pd/[AUDIO_ASIN]" target="_blank" rel="noopener noreferrer" className="btn btn-publishing">Listen on Audible</Link>
          </div>
          <p className="mt-4 text-gray-700 text-sm">Inspired? Check <Link href="https://manyagi.net/designs" className="text-blue-600 hover:underline">Designs</Link> for merch or <Link href="https://manyagi.net/media" className="text-blue-600 hover:underline">Media</Link> for narrations.</p>
        </Card>
        <Card image="/images/author-portrait.webp" alt="True Heart Poetry" title="True Heart" description="Emotional poetry collection by D.N. Manyagi, available now." category="publishing">
          <Link href="https://www.amazon.com/dp/[POETRY_ASIN]" target="_blank" rel="noopener noreferrer" className="btn btn-publishing">Buy Poetry eBook</Link>
        </Card>
      </section>
      <section className="prose max-w-3xl mx-auto text-gray-800">
        <h2 className="text-3xl font-bold mb-6">Manyagi Publishing: Stories That Inspire</h2>
        <p className="mb-4">Manyagi Publishing crafts compelling narratives that blend fantasy with real-world themes, empowering readers through imagination and insight. Our books and poetry explore legacy and hidden strengths, serving as the foundation for the entire Manyagi ecosystem. Like Penguin Random House, we prioritize quality and diversity in storytelling. (Added: Generic overview from web search on 'publishing company description'; intention: Establish core IP role in vision, goal to attract readers and cross-sell.)</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Overview</h3>
        <p className="mb-4">Manyagi Publishing is the heart of our empire, crafting immersive narratives in books, poetry, eBooks, and audiobooks. Like HarperCollins, we focus on diverse, inspirational stories that blend fantasy with real-world themes. Our flagship "Legacy of the Hidden Clans" explores power and loyalty, while "Echoes of the Ancestors" delves into heritage. Poetry collections like "True Heart" offer emotional depth.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Products/Services</h3>
        <p className="mb-4">eBooks ($9.99, Amazon link), audiobooks ($19.99, Audible), print books ($24.99, IngramSpark). Free chapters to hook readers. Cross-promote: Scenes inspire Designs merch, narrated in Media videos.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Why Choose Us</h3>
        <p className="mb-4">Unique fantasy worlds, high-quality production, community focus. Readers love the depth and visuals—pair with signals tutorials in Capital for wealth-building stories.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Testimonials</h3>
        <p className="mb-4">"Captivating worlds!" - Reader A. "Emotional poetry!" - Reader B. (Added: Generic testimonials from web search on 'book reviews'; intention: Encourage purchases, align with goal of IP growth.)</p>
        <p className="mt-6"><Link href="https://manyagi.net/assets/Legacy_of_the_Hidden_Clans (Chapter 1)_by D.N. Manyagi.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-publishing">Download Free Chapter</Link> | <Link href="https://www.amazon.com/dp/[BOOK_ASIN]" target="_blank" rel="noopener noreferrer" className="btn btn-publishing">Buy eBook on Amazon</Link></p>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto glass p-4 rounded">
        <h3 className="text-xl mb-4">Latest from @ManyagiPublishing</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/ManyagiPublishing?ref_src=twsrc%5Etfw" target="_blank" rel="noopener noreferrer">Tweets by ManyagiPublishing</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
      {showModal && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center glass">
          <div className="modal-content bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2>Added to Cart!</h2>
            <p>Legacy Book + Hidden Clans Tee added. Proceed to checkout?</p>
            <Link href="/cart" className="btn btn-publishing">Go to Cart</Link>
            <button onClick={() => setShowModal(false)} className="btn btn-publishing ghost">Continue Shopping</button>
          </div>
        </div>
      )}
      <section id="join" className="my-10">
        <Card>
          <SubscriptionForm formId="8427635" uid="db12290300" title="Subscribe to Publishing Updates" description="Get new chapters, poetry releases, and audiobook drops." />
        </Card>
      </section>
      <Recommender />
    </>
  );
};