// pages/media.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

export default function Media() {
  const videos = [
    { id: '1', title: 'Legacy in Motion', thumbnail: '/images/video-carousel-1.webp', youtubeId: 'YOUTUBE_ID_1' },
    { id: '2', title: 'Behind the Scenes', thumbnail: '/images/video-carousel-2.webp', youtubeId: 'YOUTUBE_ID_2' },
    { id: '3', title: 'Story Audio', thumbnail: '/images/video-carousel-3.webp', spotifyId: 'SPOTIFY_ID_1' },
  ];

  return (
    <>
      <Head>
        <title>Manyagi Media — Videos & Audio</title>
        <meta name="description" content="Watch and listen to stories in motion." />
      </Head>
      <Hero
        kicker="Media"
        title="Stories in Motion"
        lead="Explore videos and audio inspired by our narratives."
        videoSrc="/videos/hero-bg.mp4"
        height="h-[600px]"
      >
        <Link href="#videos" className="btn bg-red-600 text-white py-2 px-4 rounded hover:scale-105 transition">
          Watch Now
        </Link>
      </Hero>
      <section id="videos" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        {videos.map((video) => (
          <Card
            key={video.id}
            title={video.title}
            description="Watch or listen to our latest media content."
            image={video.thumbnail}
            link={video.youtubeId ? `https://youtube.com/watch?v=${video.youtubeId}` : `https://open.spotify.com/episode/${video.spotifyId}`}
            category="media"
            className="text-center"
          >
            <Link
              href={video.youtubeId ? `https://youtube.com/watch?v=${video.youtubeId}` : `https://open.spotify.com/episode/${video.spotifyId}`}
              className="btn bg-red-600 text-white py-2 px-4 rounded hover:scale-105 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch
            </Link>
          </Card>
        ))}
      </section>
      <section id="playlists" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-6">Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card
            title="YouTube Playlist"
            description="Curated videos from Manyagi Media."
            image="/images/video-carousel-1.webp"
            link="https://youtube.com/playlist?list=YOUTUBE_PLAYLIST_ID"
            category="media"
            className="text-center"
          >
            <Link href="https://youtube.com/playlist?list=YOUTUBE_PLAYLIST_ID" className="text-red-600 hover:underline">Watch Now</Link>
          </Card>
          <Card
            title="Spotify Playlist"
            description="Audio stories and podcasts."
            image="/images/video-carousel-2.webp"
            link="https://open.spotify.com/playlist/SPOTIFY_PLAYLIST_ID"
            category="media"
            className="text-center"
          >
            <Link href="https://open.spotify.com/playlist/SPOTIFY_PLAYLIST_ID" className="text-red-600 hover:underline">Listen Now</Link>
          </Card>
        </div>
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8432518"
          uid="c735e4a3a7"
          title="Subscribe to Media Updates"
          description="Get new videos and audio releases."
        />
      </section>
      <Recommender />
    </>
  );
};