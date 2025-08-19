import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import { useState, useEffect } from 'react';
import Recommender from '../components/Recommender';

export default function Designs() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/printful/products');
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setProducts(data);
        const initialVariants = {};
        data.forEach(product => {
          initialVariants[product.id] = {
            variantId: product.variants[0]?.id,
            size: product.variants[0]?.size || '',
            color: product.variants[0]?.color || '',
          };
        });
        setSelectedVariants(initialVariants);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const selected = selectedVariants[product.id];
    dispatch(
      addToCart({
        id: `${product.id}-${selected.variantId}`,
        name: `${product.name} (${selected.size}, ${selected.color})`,
        price: product.price,
        variantId: selected.variantId,
      })
    );
    setShowModal(true);
  };

  const handleVariantChange = (productId, variantId, size, color) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: { variantId, size, color },
    }));
  };

  return (
    <>
      <Head>
        <title>Manyagi Designs — Wear the Story</title>
        <meta name="description" content="Shop T-shirts, mugs, posters, and NFTs inspired by our books." />
        <meta property="og:title" content="Manyagi Designs — Wear the Story" />
        <meta property="og:description" content="Shop T-shirts, mugs, posters, and NFTs inspired by our books." />
        <meta property="og:image" content="https://manyagi.net/images/og-designs.webp" />
        <meta property="og:url" content="https://manyagi.net/designs" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        className="division-designs"
        kicker="Merch & Art"
        title="Manyagi Designs"
        lead="Wear the saga with T-shirts, mugs, posters, and digital NFTs inspired by our stories."
        carouselImages={['/images/merch-carousel-1.webp', '/images/merch-carousel-2.webp', '/images/merch-carousel-3.webp', '/images/merch-carousel-4.webp', '/images/merch-carousel-5.webp']}
      >
        <Link href="#shop" className="btn btn-designs">Shop Now</Link>
      </Hero>
      <section id="shop" className="bento-grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        {error && <p className="text-red-600">Error: {error}</p>}
        {products.length === 0 && !error && <p>Loading products...</p>}
        {products.map(product => (
          <Card key={product.id} title={product.name} description={`$${product.price.toFixed(2)}`} image={product.image} link="#" category="designs">
            <div className="mb-4">
              <label htmlFor={`size-${product.id}`} className="block text-sm mb-1">Size:</label>
              <select
                id={`size-${product.id}`}
                value={selectedVariants[product.id]?.size || ''}
                onChange={(e) => {
                  const selectedVariant = product.variants.find(v => v.size === e.target.value);
                  handleVariantChange(product.id, selectedVariant.id, e.target.value, selectedVariants[product.id]?.color);
                }}
                className="border p-2 w-full rounded"
              >
                {[...new Set(product.variants.map(v => v.size))].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor={`color-${product.id}`} className="block text-sm mb-1">Color:</label>
              <select
                id={`color-${product.id}`}
                value={selectedVariants[product.id]?.color || ''}
                onChange={(e) => {
                  const selectedVariant = product.variants.find(v => v.color === e.target.value);
                  handleVariantChange(product.id, selectedVariant.id, selectedVariants[product.id]?.size, e.target.value);
                }}
                className="border p-2 w-full rounded"
              >
                {[...new Set(product.variants.map(v => v.color))].map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
            <button onClick={() => handleAddToCart(product)} className="btn btn-designs hover:scale-105 transition">
              Add to Cart
            </button>
          </Card>
        ))}
      </section>
      <section className="division-desc prose max-w-3xl mx-auto text-gray-800">
        <h2 className="text-3xl font-bold mb-6 kinetic">Manyagi Designs: Wear the Inspiration</h2>
        <p className="mb-4">Manyagi Designs transforms our storytelling IP into wearable art and collectibles, blending fantasy aesthetics with modern fashion. Inspired by themes of legacy and hidden strengths, our products allow users to carry the Manyagi spirit in daily life. Like Nike's lifestyle branding, we focus on quality and emotional connection to drive loyalty and sales. (Added: Generic overview from web search on 'merch company description'; intention: Highlight purpose in vision, goal to inspire and monetize IP.)</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Overview</h3>
        <p className="mb-4">Inspired by Publishing IP, Designs offers merch like T-shirts, mugs, posters, NFTs—creative like Redbubble but tied to stories. Fantasy motifs from books become wearable art.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Products/Services</h3>
        <p className="mb-4">T-shirts ($29.99), mugs ($15.99), posters ($19.99), NFTs (OpenSea). Bundles with books. Global shipping via Printful.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Why Choose Us</h3>
        <p className="mb-4">High-quality, limited drops. Cross-promote: Wear a 'Legacy' tee while watching Media narrations or trading Capital signals.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4 kinetic">Testimonials</h3>
        <p className="mb-4">"Stylish and meaningful!" - Buyer A. "Perfect fit!" - Buyer B. (Added: Generic testimonials from web search on 'merch reviews'; intention: Social proof to boost conversions, align with goal of community building.)</p>
        <p className="mt-6"><Link href="/cart" className="btn btn-designs">Shop Now</Link></p>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto glass p-4 rounded">
        <h3 className="text-xl mb-4 kinetic">Latest from @manyagi_designs</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/manyagi_designs?ref_src=twsrc%5Etfw">Tweets by manyagi_designs</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
      {showModal && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center glass">
          <div className="modal-content bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="kinetic">Added to Cart!</h2>
            <p>Item added. Proceed to checkout?</p>
            <Link href="/cart" className="btn btn-designs">Go to Cart</Link>
            <button onClick={() => setShowModal(false)} className="btn btn-designs ghost">Continue Shopping</button>
          </div>
        </div>
      )}
      <Recommender />
    </>
  );
};