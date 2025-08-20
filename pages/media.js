// pages/media.js
import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import Recommender from '../components/Recommender';
import SubscriptionForm from '../components/SubscriptionForm';

export default function Media() {
  return (
    <>
      <Head>
        <title>Manyagi Media — Stories in Motion</title>
        <meta name="description" content="Watch narrations, tutorials, podcasts, and Shorts across our universe." />
        <meta property="og:title" content="Manyagi Media — Stories in Motion" />
        <meta property="og:description" content="Watch narrations, tutorials, podcasts, and Shorts across our universe." />
        <meta property="og:image" content="https://manyagi.net/images/og-media.webp" />
        <meta property="og:url" content="https://manyagi.net/media" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        className="division-media"
        kicker="Videos & Podcasts"
        title="Manyagi Media"
        lead="From book narrations to trading tutorials, our content brings the Manyagi universe to life."
        carouselImages={['/images/video-carousel-1.webp', '/images/video-carousel-2.webp', '/images/video-carousel-3.webp', '/images/video-carousel-4.webp', '/images/video-carousel-5.webp']}
      >
        <Link href="https://www.youtube.com/@ManyagiMedia" target="_blank" rel="noopener noreferrer" className="btn btn-media">Subscribe on YouTube</Link>
      </Hero>
      <section className="bento-grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Card>
          <img src="/images/video-carousel-1.webp" alt="Narration" className="w-full rounded mb-4" loading="lazy" />
          <h3 className="text-2xl mb-2">Book Narrations</h3>
          <p className="text-gray-700 mb-4">Listen to Legacy of the Hidden Clans chapters.</p>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/[VIDEO_ID]" title="Chapter 1 Narration" frameborder="0" allowfullscreen></iframe>
        </Card>
        <Card>
          <img src="/images/video-carousel-2.webp" alt="Tutorial" className="w-full rounded mb-4" loading="lazy" />
          <h3 className="text-2xl mb-2">Trading Tutorials</h3>
          <p className="text-gray-700 mb-4">Learn signals with Capital.</p>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/[VIDEO_ID2]" title="Signals Tutorial" frameborder="0" allowfullscreen></iframe>
        </Card>
      </section>
      <section className="my-10">
        <h2 className="text-3xl font-bold mb-6">Playlists by Division</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Publishing Playlist">
            <iframe width="100%" height="315" src="https://www.youtube.com/embed/videoseries?list=[PUBLISHING_PLAYLIST_ID]" title="Publishing Playlist" frameborder="0" allowfullscreen></iframe>
          </Card>
          <Card title="Designs Playlist">
            <iframe width="100%" height="315" src="https://www.youtube.com/embed/videoseries?list=[DESIGNS_PLAYLIST_ID]" title="Designs Playlist" frameborder="0" allowfullscreen></iframe>
          </Card>
          <Card title="Capital Playlist">
            <iframe width="100%" height="315" src="https://www.youtube.com/embed/videoseries?list=[CAPITAL_PLAYLIST_ID]" title="Capital Playlist" frameborder="0" allowfullscreen></iframe>
          </Card>
          <Card title="Tech Playlist">
            <iframe width="100%" height="315" src="https://www.youtube.com/embed/videoseries?list=[TECH_PLAYLIST_ID]" title="Tech Playlist" frameborder="0" allowfullscreen></iframe>
          </Card>
        </div>
      </section>
      <section className="prose max-w-3xl mx-auto text-gray-800">
        <h2 className="text-3xl font-bold mb-6">Manyagi Media: Content Hub</h2>
        <p className="mb-4">Manyagi Media is the dynamic hub for all our visual and audio content, bringing stories to life and providing educational value across divisions. From immersive narrations to practical tutorials, we aim to engage and inform our community, fostering a deeper connection with the Manyagi brand. Like TED or Vice, we blend inspiration with actionable insights. (Added: Generic overview from web search on 'media company description'; intention: Define purpose in vision, goal to engage users and drive traffic to other divisions.)</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Overview</h3>
        <p className="mb-4">Like TED/Vice, central for YT, podcasts, vlogs, Shorts, TikToks, Reels. Narrates Publishing, showcases Designs, tutorials for Capital/Tech.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Products/Services</h3>
        <p className="mb-4">Free videos/podcasts. Premium (coming: $4.99/mo exclusives). Embed playlists per division.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Why Choose Us</h3>
        <p className="mb-4">Inspirational, cross-promotional. Watch book narrations while shopping merch or learning signals.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Testimonials</h3>
        <p className="mb-4">"Engaging content!" - Viewer A. "Love the tutorials!" - Viewer B. (Added: Generic testimonials from web search on 'media content reviews'; intention: Encourage subscriptions, align with goal of community engagement.)</p>
        <p className="mt-6"><Link href="https://www.youtube.com/@ManyagiMedia" target="_blank" rel="noopener noreferrer" className="btn btn-media">Subscribe on YouTube</Link></p>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto glass p-4 rounded">
        <h3 className="text-xl mb-4">Latest from @ManyagiMedia</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/ManyagiMedia?ref_src=twsrc%5Etfw" target="_blank" rel="noopener noreferrer">Tweets by ManyagiMedia</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
      <section className="my-10">
        <Card>
          <SubscriptionForm formId="8427635" uid="db12290300" title="Subscribe to Media Updates" description="Get latest videos, podcasts, and audiobook releases." />
        </Card>
      </section>
      <Recommender />
    </>
  );
};