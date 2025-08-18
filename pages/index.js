import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import Image from 'next/image';

const carouselImages = [
  '/images/division-publishing.jpg',
  '/images/division-designs.jpg',
  '/images/division-capital.jpg',
  '/images/division-tech.jpg',
  '/images/division-media.jpg',
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Manyagi — Stories, Designs, Wealth, Tech</title>
        <meta name="description" content="Manyagi is a dynamic conglomerate empowering creators and investors through innovative publishing, designs, capital strategies, tech solutions, and media content." />
        <meta property="og:title" content="Manyagi Management" />
        <meta property="og:description" content="Manyagi is a dynamic conglomerate empowering creators and investors through innovative publishing, designs, capital strategies, tech solutions, and media content." />
        <meta property="og:image" content="/images/og-home.jpg" />
        <meta property="og:url" content="https://manyagi.net/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Manyagi Management"
        title="Manyagi: Stories, Designs, Wealth, Tech"
        lead="Discover stories that captivate, designs that inspire, wealth-building tools that empower, apps that connect, and media that engages."
        carouselImages={carouselImages}
      >
        <Link href="#subscribe" className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">Join the List</Link>
      </Hero>
      <section className="my-10 text-center">
        <p className="text-xl text-gray-600">Manyagi is a dynamic conglomerate empowering creators and investors through innovative publishing, designs, capital strategies, tech solutions, and media content.</p>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card>
          <Image src="/images/division-publishing.jpg" alt="Publishing" width={300} height={200} className="rounded mb-4" />
          <h3 className="text-2xl mb-2 text-black">Publishing</h3>
          <p className="text-gray-600 mb-4">Books, poetry, eBooks, audiobooks.</p>
          <Link href="/publishing" className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">Explore</Link>
        </Card>
        <Card>
          <Image src="/images/division-designs.jpg" alt="Designs" width={300} height={200} className="rounded mb-4" />
          <h3 className="text-2xl mb-2 text-black">Designs</h3>
          <p className="text-gray-600 mb-4">Merchandise inspired by book content.</p>
          <Link href="/designs" className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">Shop</Link>
        </Card>
        <Card>
          <Image src="/images/division-capital.jpg" alt="Capital" width={300} height={200} className="rounded mb-4" />
          <h3 className="text-2xl mb-2 text-black">Capital</h3>
          <p className="text-gray-600 mb-4">Trading signals for Crypto, Forex, Indices.</p>
          <Link href="/capital" className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">Subscribe</Link>
        </Card>
        <Card>
          <Image src="/images/division-tech.jpg" alt="Tech" width={300} height={200} className="rounded mb-4" />
          <h3 className="text-2xl mb-2 text-black">Tech</h3>
          <p className="text-gray-600 mb-4">Apps like Daito marketplace.</p>
          <Link href="/tech" className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">Learn More</Link>
        </Card>
        <Card>
          <Image src="/images/division-media.jpg" alt="Media" width={300} height={200} className="rounded mb-4" />
          <h3 className="text-2xl mb-2 text-black">Media</h3>
          <p className="text-gray-600 mb-4">YouTube, podcasts, vlogs.</p>
          <Link href="/media" className="bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400">Watch</Link>
        </Card>
      </section>
      <section id="subscribe" className="my-10">
        <Card>
          <SubscriptionForm formId="8427635" uid="db12290300" title="Join Manyagi" description="Get updates across all divisions." />
        </Card>
      </section>
      <section className="my-10">
        <Card>
          <h3 className="text-2xl mb-4 text-black">Social Feed</h3>
          {/* Placeholder for social widget - integrate X/Instagram embeds */}
          <p className="text-gray-600">Recent posts from @manyagi, @manyagi_publishing, etc.</p>
        </Card>
      </section>
    </>
  );
}