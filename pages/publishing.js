import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';
import { supabase } from '@/lib/supabase';

const asList = (v) => (Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : []);
const pickImage = (p) => p?.thumbnail_url || p?.display_image || p?.image_url || p?.image || '/placeholder.png';

export default function Publishing() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [carouselImages, setCarouselImages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch products
        const res = await fetch('/api/products?division=publishing');
        const json = await res.json();
        const list = asList(json).map((p) => ({ ...p, display_image: pickImage(p) }));
        setProducts(list);
        setTotal(Number(json?.total ?? list.length));

        // Fetch carousel images from assets
        const { data: assetData } = await supabase
          .from('assets')
          .select('file_url')
          .eq('division', 'publishing')
          .eq('purpose', 'carousel')
          .order('created_at', { ascending: false });
        const fetchedImages = assetData?.map((d) => d.file_url) || [];
        setCarouselImages(
          fetchedImages.length > 0
            ? fetchedImages
            : [
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/book-carousel-1.webp',
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/book-carousel-2.webp',
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/book-carousel-3.webp',
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/book-carousel-4.webp',
              ]
        );
      } catch (err) {
        console.error('Publishing fetch error:', err);
        setProducts([]);
        setTotal(0);
        setCarouselImages([]); // No fallback here to encourage admin uploads
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, productType: 'book' }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading books...
      </div>
    );
  }

  const list = asList(products);

  return (
    <>
      <Head>
        <title>Manyagi Publishing — Discover Epic Tales</title>
        <meta name="description" content="Immerse yourself in captivating novels and poetry by D.N. Manyagi." />
      </Head>

      <Hero
        kicker="Publishing"
        title="Uncover Hidden Worlds"
        lead="Dive into stories that transport you to new realms — and take a piece home."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#books" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Explore Our Library
        </Link>
      </Hero>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-center">What Readers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card p-4 text-center">
            <p>"A masterpiece of fantasy!"</p>
            <p className="text-sm mt-2">- Jenna Bush Hager</p>
          </div>
          <div className="card p-4 text-center">
            <p>"Captivating from page one."</p>
            <p className="text-sm mt-2">- Anonymous Reader</p>
          </div>
          <div className="card p-4 text-center">
            <p>"Poetry that resonates."</p>
            <p className="text-sm mt-2">- Literary Critic</p>
          </div>
        </div>
      </section>

      <section id="books" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        {list.length === 0 ? (
          <div className="col-span-full text-center text-lg">
            No publishing items found.
          </div>
        ) : (
          list.map((product) => {
            const m = product.metadata || {};
            const buyUrl =
              m.amazon_url ||
              m.kindle_url ||
              m.paperback_url ||
              m.store_url ||
              null;

            const alsoLinks = [
              m.kindle_url ? { label: "Kindle", url: m.kindle_url } : null,
              m.paperback_url ? { label: "Paperback", url: m.paperback_url } : null,
            ].filter(Boolean);

            const chips = [
              m.format ? String(m.format).toUpperCase() : null,
              m.year ? `Y${m.year}` : null,
            ].filter(Boolean);

            return (
              <Card
                key={product.id}
                title={product.name}
                description={product.description}
                image={product.display_image || pickImage(product)}
                category="publishing"
                tags={Array.isArray(product.tags) ? product.tags : []}
              >
                {/* Meta chips */}
                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-2">
                    {chips.map((c) => (
                      <span key={c} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Primary CTAs */}
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {buyUrl && (
                    <a
                      href={buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                    >
                      Get Your Copy
                    </a>
                  )}
                  {m.pdf_url && (
                    <a
                      href={m.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 transition"
                    >
                      Preview Chapter 1
                    </a>
                  )}
                </div>

                {/* Secondary storefront links */}
                {alsoLinks.length > 0 && (
                  <div className="text-xs text-gray-600 mt-3">
                    Also available:{' '}
                    {alsoLinks.map((l, i) => (
                      <a
                        key={l.label}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-700"
                      >
                        {l.label}{i < alsoLinks.length - 1 ? ', ' : ''}
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}

        {/* Free chapter promo card (evergreen) */}
        <Card
          title="Legacy - Chapter 1 (Free)"
          description="Sample the first chapter at no cost."
          image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/legacy-chapter-1.webp"
          category="publishing"
        >
          <a
            href="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/pdfs/Legacy_of_the_Hidden_Clans_(Chapter_1)_by_D.N._Manyagi.pdf"
            className="btn bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Free Preview
          </a>
        </Card>
      </section>

      {/* Curated Recommendations */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Top Picks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.slice(0, 3).map((p) => (
            <Card
              key={p.id}
              title={p.name}
              description={p.description}
              image={p.display_image}
            />
          ))}
          {products.length < 3 && <p className="col-span-full text-center opacity-70">Add more products in admin to populate recommendations.</p>}
        </div>
      </section>

      {/* RESTORED: subscribe block from production */}
      <section id="subscribe" className="container mx-auto px-4 py-16">
        <SubscriptionForm
          formId="8427848"
          uid="637df68a01"
          title="Subscribe to Publishing Updates"
          description="Get new chapters, poetry releases."
        />
      </section>

      <Recommender />
    </>
  );
}