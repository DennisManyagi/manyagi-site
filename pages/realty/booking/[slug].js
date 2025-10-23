// pages/realty/booking/[slug].js
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function BookingForm() {
  const router = useRouter();
  const { slug } = router.query;
  const [form, setForm] = useState({
    checkin: '', checkout: '', guests: 1, guestName: '', guestEmail: '', guestPhone: '', notes: '',
  });
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/realty/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: slug, checkin: form.checkin, checkout: form.checkout }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setQuote(json);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/realty/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: slug,
          checkin: form.checkin,
          checkout: form.checkout,
          guests: form.guests,
          quote_total_cents: quote?.summary?.total * 100,
          guestName: form.guestName,
          guestEmail: form.guestEmail,
          guestPhone: form.guestPhone,
          notes: form.notes,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      window.location.href = json.url; // Redirect to Stripe
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1>Book Property</h1>
      <div className="grid gap-4 max-w-md">
        <input type="date" value={form.checkin} onChange={e => setForm({ ...form, checkin: e.target.value })} />
        <input type="date" value={form.checkout} onChange={e => setForm({ ...form, checkout: e.target.value })} />
        <input type="number" value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} />
        <button onClick={handleQuote} disabled={loading} className="btn bg-blue-600 text-white">
          Get Quote
        </button>
        {quote && (
          <div>
            <p>Total: ${(quote.summary.total / 100).toFixed(2)}</p>
            <input placeholder="Name" value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} />
            <input placeholder="Email" value={form.guestEmail} onChange={e => setForm({ ...form, guestEmail: e.target.value })} />
            <input placeholder="Phone" value={form.guestPhone} onChange={e => setForm({ ...form, guestPhone: e.target.value })} />
            <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <button onClick={handleBook} disabled={loading} className="btn bg-green-600 text-white">
              Book Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}