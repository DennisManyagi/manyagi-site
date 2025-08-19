import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Media() {
  return (
    <>
      <Head>
        <title>Manyagi Media — Stories in Motion</title>
        <meta name="description" content="Watch narrations, tutorials, podcasts, and Shorts across our universe." />
        <meta property="og:title" content="Manyagi Media — Stories in Motion" />
        <meta property="og:description" content="Watch narrations, tutorials, podcasts, and Shorts across our universe." />
        <meta property="og:image" content="https://manyagi.net/images/og-media.jpg" />
        <meta property="og:url" content="https://manyagi.net/media" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Videos & Podcasts"
        title="Manyagi Media"
        lead="From book narrations to trading tutorials, our content brings the Manyagi universe to life."
        carouselImages={['/images/video-carousel-1.jpg', '/images/video-carousel-2.jpg', '/images/video-carousel-3.jpg', '/images/video-carousel-4.jpg', '/images/video-carousel-5.jpg']}
      >
        <Link href="https://www.youtube.com/@manyagi_media" className="btn">Subscribe on YouTube</Link>
      </Hero>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card>
          <img src="/images/video-carousel-1.jpg" alt="Narration" className="w-full rounded mb-4" />
          <h3 className="text-2xl mb-2">Book Narrations</h3>
          <p className="text-muted mb-4">Listen to Legacy of the Hidden Clans chapters.</p>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/[VIDEO_ID]" title="Chapter 1 Narration" frameborder="0" allowfullscreen></iframe>
        </Card>
        <Card>
          <img src="/images/video-carousel-2.jpg" alt="Tutorial" className="w-full rounded mb-4" />
          <h3 className="text-2xl mb-2">Trading Tutorials</h3>
          <p className="text-muted mb-4">Learn signals with Capital.</p>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/[VIDEO_ID2]" title="Signals Tutorial" frameborder="0" allowfullscreen></iframe>
        </Card>
      </section>
      <section className="division-desc prose max-w-3xl mx-auto text-gray-800">
        <h2 className="text-3xl font-bold mb-6">Manyagi Media: Content Hub</h2>
        <h3 className="text-2xl font-bold mt-6 mb-4">Overview</h3>
        <p className="mb-4">Like TED/Vice, central for YT, podcasts, vlogs, Shorts, TikToks, Reels. Narrates Publishing, showcases Designs, tutorials for Capital/Tech.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Products/Services</h3>
        <p className="mb-4">Free videos/podcasts. Premium (coming: $4.99/mo exclusives). Embed playlists per division.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Why Choose Us</h3>
        <p className="mb-4">Inspirational, cross-promotional. Watch book narrations while shopping merch or learning signals.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Testimonials</h3>
        <p className="mb-4">"Engaging content!" - Viewer A. "Love the tutorials!" - Viewer B.</p>
        <p className="mt-6"><Link href="https://www.youtube.com/@manyagi_media" className="btn">Subscribe on YouTube</Link></p>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto">
        <h3 className="text-xl mb-4">Latest from @manyagi_media</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/manyagi_media?ref_src=twsrc%5Etfw">Tweets by manyagi_media</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
    </>
  );
}