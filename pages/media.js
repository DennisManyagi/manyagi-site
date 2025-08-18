import Head from 'next/head';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Media() {
  return (
    <>
      <Head>
        <title>Manyagi Media — YouTube, Podcasts, Vlogs</title>
        <meta name="description" content="Central hub for YouTube, podcasts, vlogs, Shorts, TikToks, and Reels." />
        <meta property="og:title" content="Manyagi Media" />
        <meta property="og:description" content="Central hub for YouTube, podcasts, vlogs, Shorts, TikToks, and Reels." />
        <meta property="og:image" content="/images/og-media.jpg" />
        <meta property="og:url" content="https://manyagi.net/media" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Media Hub"
        title="Manyagi Media"
        lead="From book readings to trading tutorials."
      />
      <section className="my-10">
        <Card>
          <h3 className="text-2xl mb-4 text-black">Watch Now</h3>
          <iframe width="560" height="315" src="https://www.youtube.com/embed/playlist?list=PL..." title="YouTube Playlist" frameborder="0" allowfullscreen></iframe>
        </Card>
      </section>
      <section className="my-10">
        <Card>
          <h3 className="text-2xl mb-4 text-black">Podcasts and Vlogs</h3>
          <iframe src="https://open.spotify.com/embed/episode/..." width="100%" height="232" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
        </Card>
      </section>
      <section className="my-10">
        <Card>
          <h3 className="text-2xl mb-4 text-black">Recent Shorts/Reels</h3>
          {/* Widget or embeds */}
          <p className="text-gray-600">Stream recent content.</p>
        </Card>
      </section>
    </>
  );
}