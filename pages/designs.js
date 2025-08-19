import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import { useState, useEffect } from 'react';

export default function Designs() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({}); // Track selected size/color per product

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/printful/products');
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setProducts(data);
        // Initialize selected variants
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
        <meta property="og:image" content="https://manyagi.net/images/og-designs.jpg" />
        <meta property="og:url" content="https://manyagi.net/designs" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        kicker="Merch & Art"
        title="Manyagi Designs"
        lead="Wear the saga with T-shirts, mugs, posters, and digital NFTs inspired by our stories."
        carouselImages={['/images/merch-carousel-1.jpg', '/images/merch-carousel-2.jpg', '/images/merch-carousel-3.jpg', '/images/merch-carousel-4.jpg', '/images/merch-carousel-5.jpg']}
      >
        <Link href="#shop" className="btn">Shop Now</Link>
      </Hero>
      <section id="shop" className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        {error && <p className="text-red-600">Error: {error}</p>}
        {products.length === 0 && !error && <p>Loading products...</p>}
        {products.map(product => (
          <Card key={product.id}>
            <img src={product.image} alt={product.name} className="w-full rounded mb-4" />
            <h3 className="text-2xl mb-2">{product.name}</h3>
            <p className="text-muted mb-4">${product.price.toFixed(2)}</p>
            <div className="mb-4">
              <label htmlFor={`size-${product.id}`} className="block text-sm mb-1">Size:</label>
              <select
                id={`size-${product.id}`}
                value={selectedVariants[product.id]?.size || ''}
                onChange={(e) => {
                  const selectedVariant = product.variants.find(v => v.size === e.target.value);
                  handleVariantChange(product.id, selectedVariant.id, e.target.value, selectedVariants[product.id]?.color);
                }}
                className="border p-2 w-full"
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
                className="border p-2 w-full"
              >
                {[...new Set(product.variants.map(v => v.color))].map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleAddToCart(product)}
              className="btn"
            >
              Add to Cart
            </button>
          </Card>
        ))}
      </section>
      <section className="division-desc prose max-w-3xl mx-auto text-gray-800">
        <h2 className="text-3xl font-bold mb-6">Manyagi Designs: Wear the Inspiration</h2>
        <h3 className="text-2xl font-bold mt-6 mb-4">Overview</h3>
        <p className="mb-4">Inspired by Publishing IP, Designs offers merch like T-shirts, mugs, posters, NFTs—creative like Redbubble but tied to stories. Fantasy motifs from books become wearable art.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Products/Services</h3>
        <p className="mb-4">T-shirts ($29.99), mugs ($15.99), posters ($19.99), NFTs (OpenSea). Bundles with books. Global shipping via Printful.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Why Choose Us</h3>
        <p className="mb-4">High-quality, limited drops. Cross-promote: Wear a 'Legacy' tee while watching Media narrations or trading Capital signals.</p>
        <h3 className="text-2xl font-bold mt-6 mb-4">Testimonials</h3>
        <p className="mb-4">"Stylish and meaningful!" - Buyer A. "Perfect fit!" - Buyer B.</p>
        <p className="mt-6"><Link href="/cart" className="btn">Shop Now</Link></p>
      </section>
      <aside className="social-widget mt-8 max-w-3xl mx-auto">
        <h3 className="text-xl mb-4">Latest from @manyagi_designs</h3>
        <a className="twitter-timeline" data-height="400" href="https://twitter.com/manyagi_designs?ref_src=twsrc%5Etfw">Tweets by manyagi_designs</a>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </aside>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{error ? 'Error' : 'Added to Cart!'}</h2>
            <p>{error ? error : 'Item added. Proceed to checkout?'}</p>
            {!error && <Link href="/cart" className="btn">Go to Cart</Link>}
            <button onClick={() => setShowModal(false)} className="btn ghost">Continue {error ? 'Trying' : 'Shopping'}</button>
          </div>
        </div>
      )}
    </>
  );
}