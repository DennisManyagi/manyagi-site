// components/admin/CalendarSyncPanel.js
import React, { useState } from 'react';

/**
 * Admin panel for syncing external Airbnb/VRBO calendars.
 *
 * props:
 *  - properties: [{ id, name, slug, metadata, ... }]
 *
 * What it does:
 *  - lets you pick a property
 *  - shows that property's metadata.ical_urls (if any)
 *  - "Sync Now" POSTs to /api/realty/sync-ical with { property_id }
 *  - shows alert with results (how many imported)
 *
 * This uses the /api/realty/sync-ical endpoint you already have.
 */
export default function CalendarSyncPanel({ properties = [] }) {
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  async function runSync() {
    if (!selectedId) {
      alert('Select a property first');
      return;
    }

    setLoading(true);
    setResultMsg('');
    try {
      const res = await fetch('/api/realty/sync-ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: selectedId }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        const txt = await res.text();
        console.error('Non-JSON response from /sync-ical:', txt);
        throw new Error('Server returned non-JSON for sync-ical');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // happy path
      const msg = `Imported ${data.imported || 0} blocks from ${data.feeds || 0} feed(s).`;
      setResultMsg(msg);
      alert(msg);
    } catch (err) {
      console.error('sync-ical error:', err);
      alert('Sync failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentProperty = properties.find((p) => p.id === selectedId) || null;

  const icalList = Array.isArray(currentProperty?.metadata?.ical_urls)
    ? currentProperty.metadata.ical_urls
    : [];

  return (
    <div className="glass p-4 rounded mb-4">
      {/* Property picker + Sync button */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">Property</label>
          <select
            className="w-full dark:bg-gray-900 border rounded px-2 py-2 text-sm"
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setResultMsg('');
            }}
          >
            <option value="">Select property…</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.slug || p.id}
              </option>
            ))}
          </select>
        </div>

        <div className="shrink-0">
          <button
            className="bg-purple-600 text-white px-3 py-2 rounded text-sm font-semibold disabled:opacity-50"
            onClick={runSync}
            disabled={loading || !selectedId}
          >
            {loading ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Feed preview + result message */}
      {currentProperty && (
        <div className="mt-4 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          <div className="font-semibold mb-1">
            External iCal Feeds for this property:
          </div>

          {icalList.length > 0 ? (
            <ul className="list-disc ml-4 space-y-1 break-all">
              {icalList.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
            </ul>
          ) : (
            <div className="opacity-70">
              No iCal feeds set. Add an array of URLs in
              <code className="px-1 py-0.5 bg-gray-900 text-white rounded text-[10px] mx-1">
                property.metadata.ical_urls
              </code>
              (edit that in the table below).
              <pre className="bg-gray-900 text-white rounded p-2 text-[10px] mt-2 whitespace-pre-wrap break-all">
{`{
  "location": "Big Bear, CA",
  "ical_urls": [
    "https://airbnb.com/calendar/ical/XXXXX.ics",
    "https://www.vrbo.com/icalendar/XXXXX.ics"
  ],
  "cover_url": "https://.../hero.webp"
}`}
              </pre>
            </div>
          )}

          {resultMsg && (
            <div className="mt-3 text-green-600 dark:text-green-400 font-semibold">
              {resultMsg}
            </div>
          )}

          <div className="mt-3 text-[10px] opacity-70 leading-relaxed">
            When you click Sync Now:
            <br />
            • We fetch each .ics feed in metadata.ical_urls<br />
            • We insert those ranges into realty_external_blocks<br />
            • Those show up as unavailable in the public calendar<br />
            • Prevents double-booking against Airbnb / VRBO
          </div>
        </div>
      )}
    </div>
  );
}
