import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import SubscriptionForm from '../components/SubscriptionForm';
import Recommender from '../components/Recommender';
import Hero from '../components/Hero';
import Card from '../components/Card';
import { supabaseAdmin } from '@/lib/supabase';

export default function Publishing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('division', 'publishing')
        .eq('status', 'active');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Publishing fetch error:', error);
      setProducts([
        { 
          id: 'legacy', 
          name: 'Legacy of the Hidden Clans eBook', 
          price: 9.99, 
          image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/legacy-chapter-1.webp', 
          division: 'publishing', 
          description: 'Epic novel by D.N. Manyagi', 
          productType: 'book' 
        },
        { 
          id: 'poetry', 
          name: 'Poetry Collection eBook', 
          price: 4.99, 
          image_url: 'https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/book-carousel-1.webp', 
          division: 'publishing', 
          description: 'Heartfelt verses', 
          productType: 'book' 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

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
    return <div className="container mx-auto px-4 py-16 text-center">Loading books...</div>;
  }

  return (
    <>
      <Head>
        <title>Manyagi Publishing — Novels & Poetry</title>
        <meta name="description" content="Discover novels and poetry by D.N. Manyagi." />
      </Head>
      <Hero
        kicker="Publishing"
        title="Readers' Picks"
        lead="Summer's not over yet! Discover what avid readers have chosen as essential reads."
        carouselImages={carouselImages}
        height="h-[600px]"
      >
        <Link href="#books" className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Read More
        </Link>
      </Hero>
      
      <section id="books" className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        {products.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            description={product.description}
            image={product.image_url}
            category="publishing"
            buyButton={product}
            onBuy={() => handleAddToCart(product)}
          >
            <div className="flex gap-4 mt-4">
              <Link href={`/publishing/${product.id}`} className="btn bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                Buy on Amazon
              </Link>
              <Link href={product.metadata?.pdf_url || '#'} className="btn bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition">
                Read Chapter 1
              </Link>
            </div>
          </Card>
        ))}
        
        {/* Free Chapter Links */}
        <Card
          title="Legacy - Chapter 1 (Free)"
          description="Read the first chapter for free."
          image="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/images/legacy-chapter-1.webp"
          category="publishing"
        >
          <Link 
            href="https://dlbbjeohndiwtofitwec.supabase.co/storage/v1/object/public/assets/pdfs/Legacy_of_the_Hidden_Clans_(Chapter_1)_by_D.N._Manyagi.pdf" 
            className="btn bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            target="_blank"
          >
            Download PDF
          </Link>
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