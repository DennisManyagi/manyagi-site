// pages/realty/[slug].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS }
});

export default function PropertyDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [property, setProperty] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState(1);
  const [quote, setQuote] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (slug) {
      fetch(`/api/realty/property?slug=${slug}`)
        .then(res => res.json())
        .then(data => {
          setProperty(data.property);
          setAvailability(data.availability || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  const getQuote = async () => {
    if (!checkin || !checkout) return alert('Select dates');
    setBusy(true);
    try {
      const res = await fetch('/api/realty/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: property.id, checkin, checkout }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setQuote(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const book = async () => {
    if (!quote) return alert('Get a quote first');
    if (!guestName || !guestEmail) return alert('Enter guest details');
    setBusy(true);
    try {
      const res = await fetch('/api/realty/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          checkin,
          checkout,
          guests,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          notes,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Failed to book');
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const events = availability.map(a => ({
    title: a.status,
    start: new Date(a.date),
    end: new Date(a.date),
    allDay: true,
  }));

  if (loading) return <div>Loading property...</div>;
  if (!property) return <div>Property not found</div>;

  return (
    <>
      <Head>
        <title>{property.name} — Manyagi Realty</title>
        <meta name="description" content={property.description} />
      </Head>
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">{property.name}</h1>
        <img src={property.image_url} alt={property.name} className="w-full h-64 object-cover rounded mb-6" />
        <p className="mb-4">{property.description}</p>
        <p><strong>Price per night:</strong> ${property.nightly_price}</p>

        <h2 className="text-2xl font-bold mt-8">Availability</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />

        <h2 className="text-2xl font-bold mt-8">Book Now</h2>
        <div className="space-y-4">
          <input type="date" value={checkin} onChange={e => setCheckin(e.target.value)} />
          <input type="date" value={checkout} onChange={e => setCheckout(e.target.value)} />
          <input type="number" value={guests} onChange={e => setGuests(e.target.value)} min="1" />
          <button onClick={getQuote} disabled={busy}>Get Quote</button>
          {quote && (
            <div>
              <p>Total: ${quote.summary.total}</p>
              <input placeholder="Name" value={guestName} onChange={e => setGuestName(e.target.value)} />
              <input placeholder="Email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
              <input placeholder="Phone" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
              <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
              <button onClick={book} disabled={busy}>Book Now</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}