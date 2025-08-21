// pages/publishing.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';

export default function Publishing() {
  const carouselImages = [
    '/images/book-carousel-1.webp',
    '/images/book-carousel-2.webp',
    '/images/book-carousel-3.webp',
    '/images/book-carousel-4.webp',
  ];

  return (
    <>
      <Head>
        <title>Manyagi Publishing — Novels & Poetry</title>
        <meta name="description" content="Discover novels and poetry by D.N. Manyagi." />
      </Head>
      <Hero
        kicker="Publishing"
        title="Readers’ Picks"
        lead="Summer’s not over yet! Discover what avid readers have chosen as essential reads."
        carouselImages={carouselImages}
        height="h-[400px]"
      >
        <Link href="#books" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Read More
        </Link>
      </Hero>
      <section id="books" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card bg-gray-100 rounded p-4">
          <img src="/images/legacy-chapter-1.webp" alt="Legacy of the Hidden Clans" className="w-full h-[300px] object-cover mb-4" />
          <h3 className="text-32px font-bold">Legacy of the Hidden Clans</h3>
          <p className="text-16px">Embark on an epic journey with D.N. Manyagi’s novel.</p>
          <div className="flex gap-4 mt-4">
            <Link href="https://amazon.com/legacy-hidden-clans" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
              Buy on Amazon
            </Link>
            <Link href="/assets/Legacy_of_the_Hidden_Clans (Chapter 1)_by D.N. Manyagi.pdf" className="btn bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition">
              Read Chapter 1
            </Link>
            <Link href="https://amazon.com/legacy-hidden-clans-audiobook" className="btn bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition">
              Audiobook
            </Link>
          </div>
        </div>
        <div className="card bg-gray-100 rounded p-4">
          <img src="/images/book-carousel-1.webp" alt="Poetry Collection" className="w-full h-[300px] object-cover mb-4" />
          <h3 className="text-32px font-bold">Poetry Collection</h3>
          <p className="text-16px">Explore heartfelt verses by D.N. Manyagi.</p>
          <div className="flex gap-4 mt-4">
            <Link href="https://amazon.com/manyagi-poetry" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
              Buy on Amazon
            </Link>
            <Link href="https://amazon.com/manyagi-poetry-ebook" className="btn bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition">
              eBook
            </Link>
          </div>
        </div>
        <div className="card bg-gray-100 rounded p-4">
          <img src="/images/book-carousel-2.webp" alt="Novel Two" className="w-full h-[300px] object-cover mb-4" />
          <h3 className="text-32px font-bold">Novel Two</h3>
          <p className="text-16px">A thrilling sequel to Legacy of the Hidden Clans.</p>
          <div className="flex gap-4 mt-4">
            <Link href="/assets/Legacy_of_the_Hidden_Clans (Chapter 2)_by D.N. Manyagi.pdf" className="btn bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition">
              Read Chapter 2
            </Link>
            <Link href="https://amazon.com/legacy-hidden-clans-2" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
              Buy on Amazon
            </Link>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Discover Your Next Read</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gray-100 rounded p-4">
            <h3 className="text-2xl font-bold">New Releases</h3>
            <p className="text-16px">Fresh stories to dive into.</p>
            <Link href="#new-releases" className="text-blue-600 hover:underline">See the list</Link>
          </div>
          <div className="bg-gray-100 rounded p-4">
            <h3 className="text-2xl font-bold">Best Sellers</h3>
            <p className="text-16px">Top picks from our readers.</p>
            <Link href="#best-sellers" className="text-blue-600 hover:underline">See the list</Link>
          </div>
          <div className="bg-gray-100 rounded p-4">
            <h3 className="text-2xl font-bold">Poetry</h3>
            <p className="text-16px">Explore our poetic collections.</p>
            <Link href="#poetry" className="text-blue-600 hover:underline">See the list</Link>
          </div>
        </div>
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427848"
          uid="637df68a01"
          title="Subscribe to Publishing Updates"
          description="Get new chapters, poetry releases."
        />
      </section>
      <Recommender />
    </>
  );
};