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
        <meta property="og:image" content="https://manyagi.net/images/og-about.jpg" />
        <meta property="og:url" content="https://manyagi.net/about" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="The Empire"
        title="About Manyagi"
        lead="A global conglomerate building IP across publishing, designs, media, capital, and tech."
      />
      <section className="my-10 card">
        <h2 className="text-3xl mb-4">Our Vision</h2>
        <p className="text-muted mb-4">Manyagi is a forward-thinking conglomerate that unites innovation, creativity, and strategic business ventures under one brand. Our divisions work together to bring powerful ideas to life and deliver lasting value to our clients and audiences worldwide.</p>
      </section>
      <section className="my-10 card">
        <h2 className="text-3xl mb-4">Our Divisions</h2>
        <ul className="text-muted list-disc pl-5">
          <li><strong>Manyagi Capital</strong> – Algorithmic trading, signals and portfolio products.</li>
          <li><strong>Manyagi Designs</strong> – Apparel, prints and limited drops.</li>
          <li><strong>Manyagi Media</strong> – Audiobooks, voice, and visual storytelling.</li>
          <li><strong>Manyagi Publishing</strong> – Novels, poetry, and IP development.</li>
          <li><strong>Manyagi Tech</strong> – Daito marketplace and app incubation.</li>
        </ul>
      </section>
      <section className="my-10 card">
        <h2 className="text-3xl mb-4">Mission</h2>
        <p className="text-muted mb-4">To create, scale and preserve intellectual property — then monetize it across product lines and media to build generational value.</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Our Team</h3>
        <p className="text-muted mb-4">A diverse group of creators, traders, developers, and storytellers.</p>
        <Image src="/images/team-photo.jpg" alt="Team Photo" width={600} height={400} className="rounded mb-4" />
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Our Values</h3>
        <ul className="text-muted text-sm list-disc pl-5">
          <li>Innovation</li>
          <li>Integrity</li>
          <li>Community</li>
        </ul>
      </section>
    </>
  );
}