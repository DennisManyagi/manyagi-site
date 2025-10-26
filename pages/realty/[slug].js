// pages/realty/[slug].js
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

// safer date builder (avoid DST weirdness by using noon local time)
function ymdToDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

// build calendar events out of merged blocks from /api/realty/calendar-blocks
function buildCalendarEvents(blocks) {
  const out = [];
  (blocks || []).forEach((b) => {
    const start = ymdToDate(b.start);

    // blocks are inclusive [start..end], but react-big-calendar
    // expects end to be EXCLUSIVE, so add 1 day
    const endInclusive = ymdToDate(b.end);
    const endExclusive = new Date(endInclusive);
    endExclusive.setDate(endExclusive.getDate() + 1);

    out.push({
      title: b.label || 'Booked',
      start,
      end: endExclusive,
      allDay: true,
      resource: b.kind || 'blocked',
    });
  });
  return out;
}

// small helper for quote breakdown rows
function MoneyRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>${Number(value || 0).toFixed(2)}</span>
    </div>
  );
}

export default function PropertyDetail() {
  const router = useRouter();
  const { slug } = router.query;

  // property record from Supabase
  const [property, setProperty] = useState(null);

  // unavailable ranges (paid reservations + synced external blocks)
  const [blocks, setBlocks] = useState([]);

  // booking form state
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState(1);

  // guest info (for checkout)
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');

  // quote result from server (pricing summary, nights, tax, etc.)
  const [quote, setQuote] = useState(null);

  // ui state flags
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // --- LOAD PROPERTY + BLOCKED DATES ---
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        // 1. property details (name, desc, gallery, metadata, etc.)
        const propRes = await fetch(`/api/realty/property?slug=${slug}`);
        const propJson = await propRes.json();

        if (!propJson.ok || !propJson.property) {
          setProperty(null);
          setBlocks([]);
          setLoading(false);
          return;
        }

        const propRow = propJson.property;
        setProperty(propRow);

        // 2. merged calendar blocks (paid reservations + external blocks)
        const blkRes = await fetch(
          `/api/realty/calendar-blocks?property_id=${encodeURIComponent(
            propRow.id
          )}`
        );
        const blkJson = await blkRes.json();
        setBlocks(blkJson.blocks || []);
      } catch (err) {
        console.error('property load err:', err);
        setProperty(null);
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // events for react-big-calendar
  const calendarEvents = useMemo(
    () => buildCalendarEvents(blocks),
    [blocks]
  );

  // Get server-side quote
  async function getQuote() {
    if (!checkin || !checkout) {
      alert('Select check-in and check-out');
      return;
    }
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

      if (!data.ok) {
        throw new Error(data.error || 'Failed to get quote');
      }

      setQuote(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Start Stripe Checkout session
  async function book() {
    if (!quote) {
      alert('Get a quote first');
      return;
    }
    if (!guestName || !guestEmail) {
      alert('Enter name and email');
      return;
    }

    // ADDED:
    // If they don't meet min stay, block booking
    if (quote && quote.meets_min_stay === false) {
      alert(
        `This stay does not meet the minimum of ${quote.min_nights_required} night${
          Number(quote.min_nights_required) === 1 ? '' : 's'
        } for those dates.`
      );
      return;
    }

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
        alert(data.error || 'Checkout failed');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  // CHANGED:
  // min-stay warning now uses the server's result
  const minStayWarning = useMemo(() => {
    if (!quote) return '';
    if (quote.meets_min_stay === false) {
      const req = Number(quote.min_nights_required || 0);
      if (req > 1) {
        return `This stay is below the ${req}-night minimum for those dates.`;
      } else {
        return 'This stay may not meet the minimum nights requirement.';
      }
    }
    return '';
  }, [quote]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        Loading property...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-16">
        Property not found.
      </div>
    );
  }

  // ---- UI DERIVED FIELDS ----

  // Gallery
  const coverImg =
    property.metadata?.cover_url ||
    property.image_url ||
    '/placeholder.png';

  const galleryFromMeta = Array.isArray(
    property.metadata?.gallery_urls
  )
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

  // Property location for map
  const mapQuery =
    typeof property.metadata?.location === 'string' &&
    property.metadata.location.trim().length > 2
      ? property.metadata.location.trim()
      : null;

  // Stats
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

      <section className="container mx-auto px-4 pb-32 pt-16 md:pb-16 max-w-5xl">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-6">{property.name}</h1>

        {/* HERO IMAGE + THUMBS */}
        <div className="mb-8">
          {/* main hero image */}
          <div className="w-full h-64 md:h-[400px] rounded overflow-hidden bg-gray-200 mb-4">
            <img
              src={gallery[0]}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* thumbnails */}
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

          {/* more photos indicator */}
          {gallery.length > 6 && (
            <div className="text-sm text-blue-600 mt-2 cursor-pointer">
              + {gallery.length - 6} more photos
            </div>
          )}
        </div>

        {/* QUICK FACTS */}
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

        {/* DESCRIPTION */}
        <p className="mb-6 whitespace-pre-line text-gray-800 dark:text-gray-200">
          {property.description}
        </p>

        {/* PRICE REMINDER */}
        <p className="mb-10 font-semibold">
          Price per night:{' '}
          {property.nightly_price
            ? `$${property.nightly_price}`
            : '—'}
        </p>

        {/* MAP */}
        {mapQuery && (
          <div className="mt-8 mb-12">
            <h2 className="text-2xl font-bold mb-2">Location</h2>
            <div className="w-full h-[350px] bg-gray-200 rounded overflow-hidden border border-gray-300 dark:border-gray-700">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  mapQuery
                )}&output=embed`}
                width="100%"
                height="350"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* AVAILABILITY CALENDAR */}
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-bold mb-2">Availability</h2>

          <div className="bg-white dark:bg-gray-900 rounded shadow p-4 overflow-auto border border-gray-200 dark:border-gray-700">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              views={['month']}
              defaultView="month"
              popup
              tooltipAccessor={(event) => event.title}
              style={{ height: 500 }}
              eventPropGetter={() => {
                // style blocked ranges (booked/unavailable)
                return {
                  className:
                    'bg-red-500/20 text-red-700 border border-red-300 rounded',
                };
              }}
            />
            <p className="text-xs opacity-70 mt-2">
              Marked dates are unavailable.
            </p>
          </div>
        </div>

        {/* BOOKING FORM */}
        <div className="mt-12" id="booking-form">
          <h2 className="text-2xl font-bold mb-4">
            Book Your Stay
          </h2>

          {/* inputs for checkin / checkout / guests / Get Quote */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold">
                Check-in
              </label>
              <input
                type="date"
                className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Check-out
              </label>
              <input
                type="date"
                className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Guests
              </label>
              <input
                type="number"
                min="1"
                className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={getQuote}
                disabled={busy}
                className="bg-blue-600 text-white rounded px-4 py-2 w-full font-semibold disabled:opacity-50"
              >
                {busy ? 'Calculating…' : 'Get Quote'}
              </button>
            </div>
          </div>

          {/* QUOTE BREAKDOWN */}
          {quote && quote.summary && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 mb-6 text-sm border border-gray-200 dark:border-gray-700">
              <div className="font-semibold mb-2">
                {quote.summary.nights} night
                {quote.summary.nights === 1 ? '' : 's'} breakdown
              </div>

              {/* ADDED: show min stay requirement if >1 */}
              {Number(quote.min_nights_required || 0) > 1 && (
                <div className="text-xs mb-2 text-gray-700 dark:text-gray-300">
                  {quote.min_nights_required}-night minimum for
                  these dates.
                </div>
              )}

              <MoneyRow
                label="Nightly subtotal"
                value={quote.summary.base_subtotal}
              />
              {Number(quote.summary.cleaning_fee || 0) > 0 && (
                <MoneyRow
                  label="Cleaning fee"
                  value={quote.summary.cleaning_fee}
                />
              )}
              {Number(quote.summary.tax_amount || 0) > 0 && (
                <MoneyRow
                  label={`Tax (${(
                    Number(quote.summary.tax_rate || 0) * 100
                  ).toFixed(1)}%)`}
                  value={quote.summary.tax_amount}
                />
              )}

              <div className="border-t my-2 dark:border-gray-600" />

              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>
                  ${Number(quote.summary.total || 0).toFixed(2)}
                </span>
              </div>

              {/* CHANGED: smarter warning */}
              {minStayWarning && (
                <div className="mt-2 text-yellow-700 bg-yellow-100 border border-yellow-300 text-xs rounded p-2 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-600">
                  {minStayWarning}
                </div>
              )}
            </div>
          )}

          {/* GUEST INFO + CHECKOUT */}
          {quote && quote.summary && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  className="border rounded px-2 py-2 w-full dark:bg-gray-800 dark:border-gray-600"
                  placeholder="Full name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
                <input
                  className="border rounded px-2 py-2 w-full dark:bg-gray-800 dark:border-gray-600"
                  placeholder="Email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
                <input
                  className="border rounded px-2 py-2 w-full dark:bg-gray-800 dark:border-gray-600"
                  placeholder="Phone (optional)"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>

              <textarea
                className="border rounded px-2 py-2 w-full dark:bg-gray-800 dark:border-gray-600"
                placeholder="Notes for host (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <button
                onClick={book}
                disabled={
                  busy ||
                  (quote && quote.meets_min_stay === false)
                }
                className="bg-green-600 text-white rounded px-4 py-3 font-semibold w-full md:w-auto disabled:opacity-50"
              >
                {busy
                  ? 'Processing…'
                  : quote && quote.meets_min_stay === false
                  ? 'Minimum Not Met'
                  : 'Book Now'}
              </button>
            </div>
          )}
        </div>

        {/* Contact fallback if no quote yet */}
        {!quote && (
          <div className="text-xs opacity-70 mt-8">
            Need custom dates or long-term stay? Contact us.
          </div>
        )}
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-gray-900 text-black dark:text-white border-t border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
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
          className="bg-yellow-500 text-black dark:text-black font-semibold py-2 px-4 rounded hover:bg-yellow-400 transition"
        >
          Book Now
        </button>
      </div>
    </>
  );
}
