import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// react-big-calendar localizer
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
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

  // fetch property + availability
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`/api/realty/property?slug=${slug}`);
        const data = await res.json();
        if (data.error) {
          console.error('property fetch error:', data.error);
          setProperty(null);
        } else {
          setProperty(data.property);
          setAvailability(data.availability || []);
        }
      } catch (err) {
        console.error('property fetch crash:', err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // normalize availability for calendar
  const events = useMemo(
    () =>
      availability.map((a) => ({
        title: a.status || 'unavailable',
        start: new Date(a.date),
        end: new Date(a.date),
        allDay: true,
      })),
    [availability]
  );

  // quote
  const getQuote = async () => {
    if (!checkin || !checkout) return alert('Select dates');
    if (!property) return;
    setBusy(true);
    try {
      const res = await fetch('/api/realty/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          checkin,
          checkout,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        const txt = await res.text();
        console.error('Non-JSON response from /quote:', txt);
        throw new Error('Server returned non-JSON for quote');
      }

      if (!data.ok) throw new Error(data.error || 'Failed to get quote');
      setQuote(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  // stripe checkout
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

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        const txt = await res.text();
        console.error('Non-JSON response from /create-checkout:', txt);
        throw new Error('Server error starting checkout (see console).');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to book');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-8">Loading property...</div>;
  if (!property) return <div className="p-8">Property not found</div>;

  // main image
  const coverImg =
    property.metadata?.cover_url ||
    property.image_url ||
    '/placeholder.png';

  // gallery: prefer metadata.gallery_urls, then property.gallery_urls, then fallback
  const galleryFromMeta = Array.isArray(property.metadata?.gallery_urls)
    ? property.metadata.gallery_urls
    : [];
  const galleryLegacy = Array.isArray(property.gallery_urls)
    ? property.gallery_urls
    : [];
  const gallery =
    galleryFromMeta.length > 0
      ? galleryFromMeta
      : galleryLegacy.length > 0
      ? galleryLegacy
      : [coverImg];

  // map location, if provided
  const mapQuery =
    typeof property.metadata?.location === 'string' &&
    property.metadata.location.trim().length > 5
      ? property.metadata.location.trim()
      : null;

  // property stats from metadata
  const beds = property.metadata?.beds;
  const baths = property.metadata?.baths;
  const sleeps = property.metadata?.sleeps;
  const amenities = Array.isArray(property.metadata?.amenities)
    ? property.metadata.amenities
    : [];

  return (
    <>
      <Head>
        <title>{property.name} — Manyagi Realty</title>
        <meta
          name="description"
          content={property.description || ''}
        />
      </Head>

      <section className="container mx-auto px-4 pb-32 pt-16 md:pb-16">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-6">{property.name}</h1>

        {/* GALLERY / HERO */}
        <div className="mb-8">
          {/* Main hero image */}
          <div className="w-full h-64 md:h-[400px] rounded overflow-hidden bg-gray-200 mb-4">
            <img
              src={gallery[0]}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails row */}
          {gallery.length > 1 && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {gallery.slice(1, 7).map((url, idx) => (
                <div
                  key={idx}
                  className="w-full h-24 md:h-28 rounded overflow-hidden bg-gray-200"
                >
                  <img
                    src={url}
                    alt={`Gallery ${idx + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* More count */}
          {gallery.length > 6 && (
            <div className="text-sm text-blue-600 mt-2 cursor-pointer">
              + {gallery.length - 6} more photos
            </div>
          )}
        </div>

        {/* QUICK FACTS: beds / baths / sleeps / amenities chips */}
        <section className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
          <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
            {beds ? (
              <div className="flex items-center gap-1">
                <span role="img" aria-label="beds">
                  🛏️
                </span>
                <span>{beds} Beds</span>
              </div>
            ) : null}

            {baths ? (
              <div className="flex items-center gap-1">
                <span role="img" aria-label="baths">
                  🛁
                </span>
                <span>{baths} Baths</span>
              </div>
            ) : null}

            {sleeps ? (
              <div className="flex items-center gap-1">
                <span role="img" aria-label="sleeps">
                  🧍‍♂️
                </span>
                <span>Sleeps {sleeps}</span>
              </div>
            ) : null}

            {property.nightly_price ? (
              <div className="flex items-center gap-1 font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs">
                <span>From ${property.nightly_price}/night</span>
              </div>
            ) : null}
          </div>

          {amenities.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2 text-xs">
              {amenities.map((am, i) => (
                <li
                  key={i}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                >
                  {am}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Description */}
        <p className="mb-6 whitespace-pre-line text-gray-800 dark:text-gray-200">
          {property.description}
        </p>

        {/* Price fallback line (in case they scrolled) */}
        <p className="mb-10 font-semibold">
          Price per night:{' '}
          {property.nightly_price ? `$${property.nightly_price}` : '—'}
        </p>

        {/* Map / Location */}
        {mapQuery && (
          <div className="mt-8 mb-12">
            <h2 className="text-2xl font-bold mb-2">Location</h2>
            <div className="w-full h-[450px] bg-gray-200 rounded overflow-hidden">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  mapQuery
                )}&output=embed`}
                width="100%"
                height="450"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Availability Calendar */}
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-bold mb-2">Availability</h2>
          <div className="bg-white rounded shadow p-4 overflow-auto">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
            />
          </div>
        </div>

        {/* Booking Form */}
        <div className="mt-12" id="booking-form">
          <h2 className="text-2xl font-bold mb-4">Book Now</h2>

          {/* date pickers / guests / Get Quote */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold">Check-in</label>
              <input
                type="date"
                className="border rounded px-2 py-1 w-full"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Check-out</label>
              <input
                type="date"
                className="border rounded px-2 py-1 w-full"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Guests</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={getQuote}
                disabled={busy}
                className="bg-blue-600 text-white rounded px-4 py-2 w-full font-semibold"
              >
                Get Quote
              </button>
            </div>
          </div>

          {quote && (
            <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-20 md:mb-4">
              <p className="mb-2">
                <strong>Total:</strong> ${quote.summary.total}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
                <input
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
                <input
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Phone"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>

              <textarea
                className="border rounded px-2 py-1 w-full mb-4"
                placeholder="Notes for host (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <button
                onClick={book}
                disabled={busy}
                className="bg-green-600 text-white rounded px-4 py-2 font-semibold w-full md:w-auto"
              >
                Book Now
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Sticky bottom CTA (mobile only) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white text-black border-t border-gray-200 p-3 flex justify-between items-center z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        <div className="text-sm font-semibold">
          {property.nightly_price
            ? `From $${property.nightly_price}/night`
            : ''}
        </div>
        <button
          onClick={() => {
            const el = document.getElementById('booking-form');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="bg-yellow-500 text-black font-semibold py-2 px-4 rounded hover:bg-yellow-400 transition"
        >
          Book Now
        </button>
      </div>
    </>
  );
}
