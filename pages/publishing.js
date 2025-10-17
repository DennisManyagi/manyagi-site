import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';

// --- small helpers (local so no extra imports)
const asList = (v) => {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.items)) return v.items;
  return [];
};

const pickImage = (p) =>
  p?.thumbnail_url ||
  p?.display_image ||
  p?.image_url ||
  p?.image ||
  '';

export default function Publishing() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products?division=publishing');
        const json = await res.json();

        const list = asList(json).map((p) => ({
          ...p,
          display_image: pickImage(p),
        }));

        // If API returned nothing, fall back to a couple demo rows so UI still renders.
        if (list.length === 0) {
          setProducts([
            {
              id: 'legacy',
              name: 'Legacy of the Hidden Clans eBook',
              price: 9.99,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/legacy-chapter-1.webp',
              division: 'publishing',
              description: 'Epic novel by D.N. Manyagi',
              productType: 'book',
              metadata: {
                amazon_url: 'https://www.amazon.com/', // placeholder
                pdf_url:
                  'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/pdfs/Legacy_of_the_Hidden_Clans_(Chapter_1)_by_D.N._Manyagi.pdf',
              },
            },
            {
              id: 'poetry',
              name: 'Poetry Collection eBook',
              price: 4.99,
              display_image:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/book-carousel-1.webp',
              division: 'publishing',
              description: 'Heartfelt verses',
              productType: 'book',
              metadata: { amazon_url: 'https://www.amazon.com/' },
            },
          ]);
          setTotal(2);
        } else {
          setProducts(list);
          setTotal(Number(json?.total ?? list.length));
        }
      } catch (error) {
        console.error('Publishing fetch error:', error);
        // Same fallback on error
        setProducts([
          {
            id: 'legacy',
            name: 'Legacy of the Hidden Clans eBook',
            price: 9.99,
            display_image:
              'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/legacy-chapter-1.webp',
            division: 'publishing',
            description: 'Epic novel by D.N. Manyagi',
            productType: 'book',
            metadata: {
              amazon_url: 'https://www.amazon.com/',
              pdf_url:
                'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/pdfs/Legacy_of_the_Hidden_Clans_(Chapter_1)_by_D.N._Manyagi.pdf',
            },
          },
          {
            id: 'poetry',
            name: 'Poetry Collection eBook',
            price: 4.99,
            display_image:
              'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/book-carousel-1.webp',
            division: 'publishing',
            description: 'Heartfelt verses',
            productType: 'book',
            metadata: { amazon_url: 'https://www.amazon.com/' },
          },
        ]);
        setTotal(2);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, productType: 'book' }));
  };

  const carouselImages = [
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/book-carousel-1.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/book-carousel-2.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/book-carousel-3.webp',
    'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/book-carousel-4.webp',
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading books...
      </div>
    );
  }

  const list = asList(products); // defensive in case state is ever set oddly

  return (
    <>
      <Head>
        <title>Manyagi Publishing — Novels & Poetry</title>
        <meta
          name="description"
          content="Discover novels and poetry by D.N. Manyagi."
        />
      </Head>

      <Hero
        kicker="Publishing"
        title="Readers' Picks"
        lead="Summer's not over yet! Discover what avid readers have chosen as essential reads."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link
          href="#books"
          className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Read More
        </Link>
      </Hero>

      <section
        id="books"
        className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {list.length === 0 ? (
          <div className="col-span-full text-center text-lg">
            No publishing items found.
          </div>
        ) : (
          list.map((product) => (
            <Card
              key={product.id}
              title={product.name}
              description={product.description}
              image={product.display_image || pickImage(product)}
              category="publishing"
              buyButton={product}
              onBuy={() => handleAddToCart(product)}
            >
              <div className="flex gap-4 mt-4">
                {product?.metadata?.amazon_url && (
                  <a
                    href={product.metadata.amazon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                  >
                    Buy on Amazon
                  </a>
                )}
                {product?.metadata?.pdf_url && (
                  <a
                    href={product.metadata.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
                  >
                    Read Chapter 1
                  </a>
                )}
              </div>
            </Card>
          ))
        )}

        {/* Free chapter promo card */}
        <Card
          title="Legacy - Chapter 1 (Free)"
          description="Read the first chapter for free."
          image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/legacy-chapter-1.webp"
          category="publishing"
        >
          <a
            href="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/pdfs/Legacy_of_the_Hidden_Clans_(Chapter_1)_by_D.N._Manyagi.pdf"
            className="btn bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download PDF
          </a>
        </Card>
      </section>

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
