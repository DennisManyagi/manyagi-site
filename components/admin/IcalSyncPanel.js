// components/admin/IcalSyncPanel.js
import React, { useState } from 'react';

/**
 * Admin control to pull Airbnb/VRBO calendar blocks into our DB.
 *
 * Flow:
 * - Select a property.
 * - Click "Sync Now".
 * - Calls /api/realty/sync-ical with { property_id }.
 *
 * On success, Supabase realty_external_blocks is refreshed for that property.
 * The public /realty/[slug] page is already reading merged data from
 * /api/realty/calendar-blocks, so blocked dates appear automatically.
 *
 * Props:
 *  - properties: array of { id, name, metadata, ... }
 */
export default function IcalSyncPanel({ properties = [] }) {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentProp = properties.find((p) => p.id === selectedPropertyId);

  // pull any ical_urls so admin can see what's going to sync
  const icalList = Array.isArray(currentProp?.metadata?.ical_urls)
    ? currentProp.metadata.ical_urls
    : [];

  async function handleSync() {
    if (!selectedPropertyId) {
      alert('Select a property first');
      return;
    }

    setIsLoading(true);
    setStatusMsg('');
    try {
      const res = await fetch('/api/realty/sync-ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: selectedPropertyId }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        const txt = await res.text();
        console.error('Non-JSON sync-ical response:', txt);
        throw new Error('Server returned non-JSON for sync-ical');
      }

      if (!data.ok && !data.imported && !data.feeds) {
        // our route returns { ok:true, feeds:n, imported:m }
        // but in some cases { ok:true, imported:0, feeds:0 }
        // if you get here, we didn't get those keys, so assume error
        throw new Error(data.error || 'Sync failed');
      }

      setStatusMsg(
        `Synced ${data.imported ?? 0} blocks from ${data.feeds ?? 0} feed(s).`
      );
    } catch (err) {
      console.error('sync-ical error:', err);
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3 glass p-4 rounded">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-4">
        {/* Property selector */}
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">
            Property
          </label>
          <select
            className="w-full dark:bg-gray-800 border dark:border-gray-600 rounded px-2 py-1 text-sm"
            value={selectedPropertyId}
            onChange={(e) => {
              setSelectedPropertyId(e.target.value);
              setStatusMsg('');
            }}
          >
            <option value="">Select property…</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || '(no name)'}
              </option>
            ))}
          </select>
        </div>

        {/* Sync button */}
        <div className="md:w-auto">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 text-sm w-full md:w-auto"
            disabled={!selectedPropertyId || isLoading}
            onClick={handleSync}
          >
            {isLoading ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Show ical_urls so admin knows what’s being synced */}
      {selectedPropertyId && (
        <div className="text-xs bg-gray-900/5 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded p-3">
          <div className="font-semibold mb-1">External Feeds:</div>
          {icalList.length === 0 ? (
            <div className="opacity-70">
              This property does not have any metadata.ical_urls yet.
              Add them in the property metadata JSON:
              <pre className="mt-2 p-2 bg-black/10 dark:bg-black/30 rounded text-[10px] whitespace-pre-wrap break-all">
{`{
  "location": "Big Bear, CA",
  "ical_urls": [
    "https://example.com/airbnb.ics",
    "https://example.com/vrbo.ics"
  ]
}`}
              </pre>
            </div>
          ) : (
            <ul className="list-disc pl-4 space-y-1 break-all">
              {icalList.map((u, i) => (
                <li key={i} className="text-[10px] md:text-[11px]">
                  {u}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Result / status */}
      {statusMsg && (
        <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-2 whitespace-pre-wrap break-all">
          {statusMsg}
        </div>
      )}

      <div className="text-[10px] opacity-60 leading-relaxed">
        This pulls reservations from Airbnb/VRBO and writes them into
        <code className="px-1 rounded bg-black/10 dark:bg-black/30">
          realty_external_blocks
        </code>
        . Those dates are merged with paid reservations and shown as
        unavailable on the public listing calendar so guests can’t double-book.
      </div>
    </div>
  );
}
