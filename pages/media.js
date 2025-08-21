// pages/media.js
import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';

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
        height="h-[500px]"
      >
        <Link href="#videos" className="btn bg-red-600 text-white py-2 px-4 rounded hover:scale-105 transition">
          Watch Now
        </Link>
      </Hero>
      <section id="videos" className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {videos.map((video) => (
          <div key={video.id} className="card bg-gray-100 rounded p-4 text-center">
            <div className="relative">
              <img src={video.thumbnail} alt={video.title} className="w-full h-[300px] object-cover mb-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-white opacity-75" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-40px font-bold">{video.title}</h3>
            <Link
              href={video.youtubeId ? `https://youtube.com/watch?v=${video.youtubeId}` : `https://open.spotify.com/episode/${video.spotifyId}`}
              className="btn bg-red-600 text-white py-2 px-4 rounded mt-4 hover:scale-105 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch
            </Link>
          </div>
        ))}
      </section>
      <section id="playlists" className="container mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6">Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gray-100 rounded p-4">
            <h3 className="text-2xl font-bold">YouTube Playlist</h3>
            <p className="text-base">Curated videos from Manyagi Media.</p>
            <Link href="https://youtube.com/playlist?list=YOUTUBE_PLAYLIST_ID" className="text-red-600 hover:underline">Watch Now</Link>
          </div>
          <div className="bg-gray-100 rounded p-4">
            <h3 className="text-2xl font-bold">Spotify Playlist</h3>
            <p className="text-base">Audio stories and podcasts.</p>
            <Link href="https://open.spotify.com/playlist/SPOTIFY_PLAYLIST_ID" className="text-red-600 hover:underline">Listen Now</Link>
          </div>
        </div>
      </section>
      <section id="subscribe" className="container mx-auto px-4 py-10">
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