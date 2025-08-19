import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Recommender from '../components/Recommender';

export default function About() {
  return (
    <>
      <Head>
        <title>About Manyagi — Our Vision</title>
        <meta name="description" content="Learn about Manyagi’s mission, history, and divisions." />
        <meta property="og:title" content="About Manyagi — Our Vision" />
        <meta property="og:description" content="Learn about Manyagi’s mission, history, and divisions." />
        <meta property="og:image" content="https://manyagi.net/images/og-about.jpg" />
        <meta property="og:url" content="https://manyagi.net/about" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Our Story"
        title="About Manyagi"
        lead="A conglomerate inspired by storytelling, innovation, and wealth-building."
      />
      <section className="prose max-w-3xl mx-auto text-gray-800 bento-grid">
        <h2 className="text-3xl font-bold mb-6 kinetic">About Manyagi</h2>
        <p className="mb-4">Manyagi is a visionary conglomerate inspired by storytelling, innovation, and wealth-building. Founded in 2025 by D.N. Manyagi, we blend fantasy narratives with real-world solutions to empower individuals through creativity and opportunity. From humble beginnings with a single poetry book, we've grown into a multibillion-dollar empire spanning five divisions, drawing on themes of legacy, echoes, and hidden strengths.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Our Vision</h3>
        <p className="mb-4">To create a unified ecosystem where stories inspire designs, fuel media content, drive financial insights, and power technological tools. Like Penguin Random House meets Nike, Bloomberg, Shopify, and Disney, we aim to scale IP across mediums for generational impact.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">History and Milestones</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>2025: Founded with "True Heart" poetry and "Legacy of the Hidden Clans" draft.</li>
          <li>Q2 2025: Launched manyagi.net, initial merch drops, forex bots.</li>
          <li>Q3 2025: Daito app beta, Media channel hits 1K subs.</li>
          <li>Q4 2025: First book release, signals subs reach 100, NFT collection.</li>
          <li>Future: Expand to crypto/stocks, global licensing, $1B valuation by 2030.</li>
        </ul>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Our Divisions</h3>
        <p className="mb-4">Publishing: Diverse stories like fantasy sagas. Designs: IP-inspired merch. Capital: Data-driven signals (Forex now, Crypto/Stocks soon). Tech: Apps for commerce/community. Media: Content hub for all.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Mission</h3>
        <p className="mb-4">Empower through stories, wealth, and innovation. Cross-promote: Books inspire merch, signals in tutorials, apps sell everything.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Future Goals</h3>
        <p className="mb-4">Become a multibillion conglomerate like Disney: IP films, global apps, ventures. Sustainability focus: Eco-merch, ethical signals.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Team</h3>
        <p className="mb-4">Led by D.N. Manyagi (Founder/CEO). [Add team member names/roles/photos as we grow.]</p>
        <img src="/images/team-photo.jpg" alt="Team Photo" className="w-full rounded-lg mb-4" loading="lazy" />
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Values</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Innovation: Push boundaries in IP and tech.</li>
          <li>Integrity: Transparent signals, fair practices.</li>
          <li>Community: Empower via apps and stories.</li>
        </ul>
      </section>
      <Recommender />
    </>
  );
}