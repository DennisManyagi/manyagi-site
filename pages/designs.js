import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import Card from '../components/Card';
import SubscriptionForm from '../components/SubscriptionForm';
import StripeCheckout from '../components/StripeCheckout';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';
import Image from 'next/image';

export default function Designs() {
  const dispatch = useDispatch();

  return (
    <>
      <Head>
        <title>Manyagi Designs — Merch & Art</title>
        <meta name="description" content="Limited drops: tees, posters, and prints inspired by Manyagi books & poetry." />
        {/* OG tags */}
      </Head>
      <Hero
        kicker="Merch & Prints"
        title="Wear the Story"
        lead="Print-on-demand collections tied to novel moments and poetry lines. No inventory. Global fulfillment."
      >
        <Link href="#drops" className="btn">View Drops</Link>
        <Link href="#notify" className="btn ghost">Get 10% Off First Order</Link>
      </Hero>
      <section id="drops" className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card>
          <Image src="/images/mock-tee-1.jpg" alt="Hidden Clans Tee" width={300} height={300} className="rounded mb-4" />
          <h3 className="text-2xl mb-2">Hidden Clans Tee</h3>
          <p className="text-muted text-sm mb-4">Quote tee • Heavyweight • Limited first run - $25</p>
          <button onClick={() => dispatch(addToCart({ id: 'tee1', name: 'Hidden Clans Tee', price: 25 }))} className="btn mb-2">Add to Cart</button>
          <StripeCheckout product="Hidden Clans Tee" />
          <p className="mt-4 text-muted text-sm">Inspired by <Link href="/publishing" className="text-accent">Publishing</Link> novels.</p>
        </Card>
        <Card>
          <Image src="/images/mock-print-1.jpg" alt="Clan Poster" width={300} height={300} className="rounded mb-4" />
          <h3 className="text-2xl mb-2">Clan Poster (A3)</h3>
          <p className="text-muted text-sm mb-4">Matte museum-grade print • Signed variant - $15</p>
          <button onClick={() => dispatch(addToCart({ id: 'poster1', name: 'Clan Poster', price: 15 }))} className="btn mb-2">Add to Cart</button>
          <StripeCheckout product="Clan Poster" />
        </Card>
        <Card>
          <Image src="/images/mock-mug-1.jpg" alt="Poetry Mug" width={300} height={300} className="rounded mb-4" />
          <h3 className="text-2xl mb-2">Poetry Mug</h3>
          <p className="text-muted text-sm mb-4">“True Heart” excerpt • Dishwasher safe - $10</p>
          <button onClick={() => dispatch(addToCart({ id: 'mug1', name: 'Poetry Mug', price: 10 }))} className="btn mb-2">Add to Cart</button>
          <StripeCheckout product="Poetry Mug" />
        </Card>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Size Chart</h3>
        <table className="w-full text-sm text-muted">
          <thead>
            <tr><th>Size</th><th>Chest</th><th>Length</th></tr>
          </thead>
          <tbody>
            <tr><td>S</td><td>34-36"</td><td>28"</td></tr>
            <tr><td>M</td><td>38-40"</td><td>29"</td></tr>
            <tr><td>L</td><td>42-44"</td><td>30"</td></tr>
            <tr><td>XL</td><td>46-48"</td><td>31"</td></tr>
            <tr><td>XXL</td><td>50-52"</td><td>32"</td></tr>
          </tbody>
        </table>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">Customer Reviews</h3>
        <p className="text-muted mb-2">"Perfect fit and quality!" - Buyer A</p>
        <p className="text-muted">"Love the designs, inspired by the books." - Buyer B</p>
      </section>
      <section className="my-10 card">
        <h3 className="text-2xl mb-4">FAQ</h3>
        <details className="mb-2">
          <summary className="cursor-pointer">Shipping time?</summary>
          <p className="text-muted text-sm">3-5 days global.</p>
        </details>
        <details>
          <summary className="cursor-pointer">Returns?</summary>
          <p className="text-muted text-sm">30-day policy.</p>
        </details>
      </section>
      <section id="notify" className="my-10">
        <Card>
          <SubscriptionForm formId="8432506" uid="a194031db7" title="Get drop alerts + 10% off" description="Join for exclusive discounts and new release notifications." />
        </Card>
      </section>
    </>
  );
}