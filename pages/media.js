import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';

export default function Media() {
  return (
    <>
      <Head>
        <title>Manyagi Media — Voice • Audio • Video</title>
        <meta name="description" content="Audiobooks, voiceovers, YouTube/Shorts, trailers and behind-the-scenes." />
        <meta property="og:title" content="Manyagi Media — Voice • Audio • Video" />
        <meta property="og:description" content="Audiobooks, voiceovers, YouTube/Shorts, trailers and behind-the-scenes." />
        <meta property="og:image" content="https://manyagi.net/images/og-media.jpg" />
        <meta property="og:url" content="https://manyagi.net/media" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Audio & Video"
        title="Manyagi Media"
        lead="Voice that carries. Audiobook chapters, poem reads, trailers, and faceless channels that scale."
      >
        <Link href="#reel" className="btn">Watch Reel</Link>
        <Link href="#collab" className="btn ghost">Collaborate</Link>
      </Hero>
      <section id="reel" className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card>
          <h3 className="text-2xl mb-2">Feature Reel</h3>
          <p className="text-muted text-sm mb-4">Watch our latest highlights.</p>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/VIDEO_ID" title="Feature Reel" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy"></iframe>
        </Card>
        <Card>
          <h3 className="text-2xl mb-2">Podcast / Readings</h3>
          <p className="text-muted text-sm mb-4">Serialized readings of chapters and poetry, with ambient sound design.</p>
          <Link href="/publishing" className="btn">Start with Chapter 1</Link>
          <p className="mt-4 text-muted text-sm">Promote <Link href="/designs" className="text-accent">merch</Link> in videos.</p>
        </Card>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Latest Videos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <iframe width="100%" height="200" src="https://www.youtube.com/embed/VIDEO_ID1" title="Video 1" frameBorder="0" allowFullScreen loading="lazy"></iframe>
          <iframe width="100%" height="200" src="https://www.youtube.com/embed/VIDEO_ID2" title="Video 2" frameBorder="0" allowFullScreen loading="lazy"></iframe>
          <iframe width="100%" height="200" src="https://www.youtube.com/embed/VIDEO_ID3" title="Video 3" frameBorder="0" allowFullScreen loading="lazy"></iframe>
        </div>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Collaborations</h3>
        <p className="text-muted mb-4">Partner with influencers, voice actors, and creators for co-productions.</p>
        <ul className="text-muted text-sm list-disc pl-5">
          <li>Previous collab with [Influencer Name]</li>
          <li>Open for guest readings</li>
        </ul>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Testimonials</h3>
        <p className="text-muted mb-2">"The audiobooks are immersive!" - Listener A</p>
        <p className="text-muted">"High-quality production." - Collaborator B</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">FAQ</h3>
        <details className="mb-2">
          <summary className="cursor-pointer">How can I collaborate?</summary>
          <p className="text-muted text-sm">Use the form below.</p>
        </details>
        <details>
          <summary className="cursor-pointer">Where to listen?</summary>
          <p className="text-muted text-sm">YouTube, Spotify, Apple Podcasts.</p>
        </details>
      </section>
      <section id="collab" className="my-10">
        <Card>
          <SubscriptionForm formId="8432518" uid="c735e4a3a7" title="Collaborate with Manyagi Media" description="Submit your ideas and get in touch." />
        </Card>
      </section>
    </>
  );
}