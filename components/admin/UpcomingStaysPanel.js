// components/admin/UpcomingStaysPanel.js
import { useEffect, useState } from 'react';

export default function UpcomingStaysPanel() {
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);

  // simple filter/search state
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/realty/upcoming');
        const data = await res.json();
        if (data.ok) {
          setStays(data.stays || []);
        } else {
          console.error('upcoming error:', data.error);
        }
      } catch (e) {
        console.error('upcoming crash:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // lightweight client-side search by guest or property
  const filtered = stays.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.guest_name.toLowerCase().includes(q) ||
      s.guest_email.toLowerCase().includes(q) ||
      s.property_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="glass p-4 rounded">
      <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
        <span>Upcoming Stays</span>
        <span className="text-xs font-normal opacity-70">
          {stays.length} total
        </span>
      </h2>

      {/* search/filter row */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <input
          className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm dark:bg-gray-900"
          placeholder="Search guest or property…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="text-xs opacity-70">
          Showing reservations with status <code>paid</code> whose checkout is
          today or later.
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded">
        <table className="min-w-[700px] w-full text-sm border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr className="text-left border-b border-gray-200 dark:border-gray-800">
              <th className="py-2 px-3">Property</th>
              <th className="py-2 px-3">Dates</th>
              <th className="py-2 px-3">Guest</th>
              <th className="py-2 px-3">Guests</th>
              <th className="py-2 px-3">Total</th>
              <th className="py-2 px-3">Contact</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  className="py-6 px-3 text-center opacity-70"
                  colSpan={6}
                >
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  className="py-6 px-3 text-center opacity-70"
                  colSpan={6}
                >
                  No upcoming paid stays.
                </td>
              </tr>
            ) : (
              filtered.map((stay) => (
                <tr
                  key={stay.id}
                  className="border-b border-gray-200 dark:border-gray-800 align-top"
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-sm">
                      {stay.property_name}
                    </div>
                    <div className="text-[11px] opacity-70">
                      /realty/{stay.property_slug}
                    </div>
                    <div className="text-[11px] opacity-70">
                      #{stay.property_id.slice(0, 6)}…
                    </div>
                  </td>

                  <td className="py-3 px-3 text-sm whitespace-nowrap">
                    <div>
                      <span className="font-medium">{stay.checkin}</span> →
                      <span className="font-medium"> {stay.checkout}</span>
                    </div>
                    <div className="text-[11px] opacity-70">
                      {stay.status === 'paid' ? '✅ Paid' : stay.status}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-sm">
                    <div className="font-medium">{stay.guest_name}</div>
                    <div className="text-[11px] opacity-70">
                      {stay.guest_email}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-sm">
                    {stay.guests || '—'}
                  </td>

                  <td className="py-3 px-3 text-sm whitespace-nowrap">
                    {stay.amount
                      ? `$${stay.amount} ${stay.currency || 'usd'}`
                      : '—'}
                  </td>

                  <td className="py-3 px-3 text-xs leading-relaxed">
                    {stay.guest_phone && (
                      <div className="opacity-90">{stay.guest_phone}</div>
                    )}
                    {stay.guest_email && (
                      <div className="opacity-70 break-all">
                        {stay.guest_email}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] opacity-60 mt-3 leading-snug">
        Tip: This list comes straight from Stripe → webhook → Supabase. As
        long as a checkout.session.completed fires and we mark the reservation
        paid, it’ll show up here. If you manually comp a guest and skip Stripe,
        you’ll need to insert a row in <code>realty_reservations</code> with
        status <code>paid</code>.
      </p>
    </div>
  );
}
