import Head from 'next/head';
import Hero from '../components/Hero';
import Card from '../components/Card';
import Image from 'next/image';

export default function About() {
  return (
    <>
      <Head>
        <title>About Manyagi</title>
        <meta name="description" content="About Manyagi — vision, mission, and divisions." />
        <meta property="og:title" content="About Manyagi" />
        <meta property="og:description" content="About Manyagi — vision, mission, and divisions." />
        <meta property="og:image" content="/images/og-about.jpg" />
        <meta property="og:url" content="https://manyagi.net/about" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="The Empire"
        title="About Manyagi"
        lead="Manyagi is a visionary conglomerate dedicated to innovation across publishing, designs, capital, tech, and media. Founded on the principles of creativity and empowerment, we create compelling stories, stylish merchandise, smart trading tools, cutting-edge apps, and engaging content to build lasting value."
      />
      <section className="my-10">
        <Card>
          <h2 className="text-3xl mb-4 text-black">Our Mission</h2>
          <p className="text-gray-600 mb-4">To inspire and enable a global audience to achieve their dreams.</p>
          <p className="text-gray-600 mb-4">Key milestones: Launched with 2 novels and 1 poetry book; expanding into AI-driven bots and apps.</p>
          <p className="text-gray-600 mb-4">Team: Passionate creators and experts driving multibillion-dollar growth.</p>
          <Image src="/images/team-photo.jpg" alt="Team Photo" width={600} height={400} className="rounded mb-4" />
          <p className="text-gray-600">From solo bootstrapping to global empire, aiming for $1B+ valuation through consistent content, cross-promotion, and scalable monetization.</p>
        </Card>
      </section>
      <section className="my-10">
        <Card>
          <h2 className="text-3xl mb-4 text-black">Our Divisions</h2>
          <ul className="text-gray-600 list-disc pl-5">
            <li><strong>Publishing</strong>: Books, poetry, eBooks, audiobooks.</li>
            <li><strong>Designs</strong>: Merchandise, NFTs inspired by content.</li>
            <li><strong>Capital</strong>: Trading signals for Crypto, Forex, Indices.</li>
            <li><strong>Tech</strong>: Apps like Daito, Nexu/Nurse.</li>
            <li><strong>Media</strong>: YouTube, podcasts, vlogs.</li>
          </ul>
        </Card>
      </section>
    </>
  );
}