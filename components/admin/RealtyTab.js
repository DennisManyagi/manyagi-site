// components/admin/RealtyTab.js
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MultiUploader from '@/components/admin/MultiUploader';
import AttachToProperty from '@/components/admin/AttachToProperty';
import PropertyRatesPanel from '@/components/admin/PropertyRatesPanel';
import RealtyTestEmailPanelWithProperty from '@/components/admin/RealtyTestEmailPanelWithProperty';
import PropertyForm from '@/components/admin/PropertyForm';
import SectionCard from '@/components/admin/SectionCard';
import { safeJSON, copyText, updateRow } from '@/lib/adminUtils';

/**
 * Small money formatter helper for table display.
 * amount_cents is stored as integer cents.
 */
function formatMoney(amount_cents, currency = 'usd') {
  if (amount_cents == null) return '—';
  const dollars = Number(amount_cents) / 100;
  return `${currency.toUpperCase()} $${dollars.toFixed(2)}`;
}

/**
 * UpcomingStaysPanel
 * - Fetches reservations from /api/realty/reservations-admin
 * - Shows future (and recent) stays, guest info, and money
 */
function UpcomingStaysPanel() {
  const [loadingResv, setLoadingResv] = useState(true);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/realty/reservations-admin');
        const j = await r.json();
        if (j.ok) {
          setReservations(j.items || []);
        } else {
          console.error('reservations-admin error:', j.error);
          setReservations([]);
        }
      } catch (err) {
        console.error('reservations-admin crash:', err);
        setReservations([]);
      } finally {
        setLoadingResv(false);
      }
    })();
  }, []);

  // simple revenue sum of PAID
  const totalPaidCents = reservations
    .filter((r) => r.status === 'paid')
    .reduce((acc, r) => acc + (Number(r.amount_cents) || 0), 0);

  return (
    <div className="space-y-4 mb-10">
      <h3 className="text-xl font-bold">Upcoming Stays / Revenue</h3>

      <div className="text-sm opacity-80">
        <div>
          <strong>Total Paid (all listed):</strong>{' '}
          {formatMoney(totalPaidCents, 'usd')}
        </div>
        <div className="text-[11px] opacity-60">
          Includes only reservations currently marked &quot;paid&quot;.
        </div>
      </div>

      <div className="overflow-x-auto border rounded dark:border-gray-700">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              <th className="py-2 px-2">Property</th>
              <th className="py-2 px-2">Stay</th>
              <th className="py-2 px-2">Nights / Guests</th>
              <th className="py-2 px-2">Guest Contact</th>
              <th className="py-2 px-2">Notes</th>
              <th className="py-2 px-2 whitespace-nowrap">Total</th>
              <th className="py-2 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loadingResv ? (
              <tr>
                <td
                  className="py-6 text-center opacity-70"
                  colSpan={7}
                >
                  Loading reservations…
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td
                  className="py-6 text-center opacity-70"
                  colSpan={7}
                >
                  No reservations yet.
                </td>
              </tr>
            ) : (
              reservations.map((r) => (
                <tr
                  key={r.id}
                  className="border-b dark:border-gray-800 align-top"
                >
                  {/* Property name / link */}
                  <td className="py-2 px-2 min-w-[140px]">
                    <div className="font-semibold">
                      {r.property_name || '—'}
                    </div>
                    {r.property_slug ? (
                      <a
                        className="text-xs text-blue-600 underline"
                        href={`/realty/${r.property_slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        /realty/{r.property_slug}
                      </a>
                    ) : (
                      <div className="text-[10px] opacity-50">
                        (no slug)
                      </div>
                    )}
                  </td>

                  {/* Dates */}
                  <td className="py-2 px-2 min-w-[140px] text-xs leading-relaxed">
                    <div>
                      <strong>Check-in:</strong> {r.checkin}
                    </div>
                    <div>
                      <strong>Check-out:</strong> {r.checkout}
                    </div>
                  </td>

                  {/* Nights / guests */}
                  <td className="py-2 px-2 min-w-[90px] text-xs leading-relaxed">
                    <div>{r.nights} nights</div>
                    <div>{r.guests} guests</div>
                  </td>

                  {/* Guest contact */}
                  <td className="py-2 px-2 min-w-[160px] text-xs leading-relaxed">
                    <div className="font-medium">
                      {r.guest_name || '—'}
                    </div>
                    <div className="break-words">
                      {r.guest_email || '—'}
                    </div>
                    {r.guest_phone ? (
                      <div className="opacity-70">
                        {r.guest_phone}
                      </div>
                    ) : null}
                  </td>

                  {/* Notes to host */}
                  <td className="py-2 px-2 min-w-[160px] text-xs">
                    {r.notes ? r.notes : <span className="opacity-50">—</span>}
                  </td>

                  {/* Amount */}
                  <td className="py-2 px-2 whitespace-nowrap text-xs font-semibold">
                    {formatMoney(r.amount_cents, r.currency)}
                  </td>

                  {/* Status */}
                  <td className="py-2 px-2 min-w-[80px] text-xs">
                    <span
                      className={
                        r.status === 'paid'
                          ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-[11px] font-semibold'
                          : 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-[11px] font-semibold'
                      }
                    >
                      {r.status || '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] opacity-60 leading-relaxed">
        This is your internal board. Cleaners / ops can look here for
        arrivals, departures, and payout amounts without touching Stripe
        or Supabase.
      </p>
    </div>
  );
}

export default function RealtyTab({
  properties: allProperties,
  assets,
  refreshAll,
}) {
  const [edits, setEdits] = useState({});
  const [openGalleryFor, setOpenGalleryFor] = useState(null);
  const [galleryDrafts, setGalleryDrafts] = useState({});
  const [newGalleryInput, setNewGalleryInput] = useState({});

  // filter just realty props and gallery assets
  const realtyProperties = allProperties
    .filter((p) => (p.division || 'realty') === 'realty')
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

  const realtyAssets = assets
    .filter(
      (a) => a.division === 'realty' && a.purpose === 'gallery'
    )
    .slice(0, 50);

  // build payload for saving edits of a property row
  const buildPayload = (row, propRow) => {
    const baseMeta = propRow.metadata || {};
    let mergedMeta = baseMeta;

    // user edited metadataStr -> parse
    if (row.metadataStr !== undefined) {
      mergedMeta = safeJSON(row.metadataStr, baseMeta);
    }

    // if they edited cover_url directly, inject into metadata
    if (row.cover_url !== undefined) {
      mergedMeta = {
        ...mergedMeta,
        cover_url: row.cover_url || '',
      };
    }

    return {
      ...(row.name !== undefined ? { name: row.name } : {}),
      ...(row.slug !== undefined ? { slug: row.slug } : {}),
      ...(row.price !== undefined
        ? { price: parseFloat(row.price || 0) }
        : {}),
      ...(row.status !== undefined ? { status: row.status } : {}),
      ...(row.description !== undefined
        ? { description: row.description }
        : {}),
      ...((row.metadataStr !== undefined ||
        row.cover_url !== undefined)
        ? { metadata: mergedMeta }
        : {}),
    };
  };

  // save basic info for a property
  const saveProperty = async (propRow) => {
    try {
      const row = edits[propRow.id] || {};
      if (!Object.keys(row).length) return;
      const payload = buildPayload(row, propRow);

      await updateRow('properties', propRow.id, payload);

      setEdits((prev) => ({ ...prev, [propRow.id]: {} }));
      refreshAll?.();
      alert('Property saved.');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  };

  // expand/collapse gallery editor for one property
  const toggleGalleryEditor = (propRow) => {
    setOpenGalleryFor((cur) =>
      cur === propRow.id ? null : propRow.id
    );

    setGalleryDrafts((prev) => {
      if (prev[propRow.id]) return prev;
      const existing = Array.from(
        new Set(
          Array.isArray(propRow.metadata?.gallery_urls)
            ? propRow.metadata.gallery_urls
            : []
        )
      );
      return {
        ...prev,
        [propRow.id]: [...existing],
      };
    });

    setNewGalleryInput((prev) => ({
      ...prev,
      [propRow.id]: '',
    }));
  };

  const removeGalleryImage = (propId, idx) => {
    setGalleryDrafts((prev) => {
      const list = prev[propId] || [];
      const next = list.filter((_, i) => i !== idx);
      return { ...prev, [propId]: next };
    });
  };

  // take comma/newline separated URLs in newGalleryInput[propId] and merge them into galleryDrafts[propId]
  const addGalleryImages = (propId) => {
    setGalleryDrafts((prev) => {
      const current = prev[propId] || [];
      const raw = newGalleryInput[propId] || '';
      const toAdd = raw
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const deduped = Array.from(
        new Set([...current, ...toAdd])
      );
      return { ...prev, [propId]: deduped };
    });

    setNewGalleryInput((prev) => ({
      ...prev,
      [propId]: '',
    }));
  };

  const saveGallery = async (propRow) => {
    const propId = propRow.id;
    const draftList = galleryDrafts[propId] || [];

    const mergedMeta = {
      ...(propRow.metadata || {}),
      gallery_urls: draftList,
    };

    const { error } = await supabase
      .from('properties')
      .update({ metadata: mergedMeta })
      .eq('id', propId);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Gallery saved.');
    refreshAll?.();
  };

  return (
    <SectionCard title="Realty / Rentals">
      <div className="space-y-6">
        {/* NEW: Upcoming stays / revenue dashboard */}
        <UpcomingStaysPanel />

        {/* uploader */}
        <div>
          <h3 className="text-xl font-bold mb-2">
            Realty Gallery Uploader
          </h3>
          <p className="text-sm opacity-80 mb-4">
            Upload multiple images to storage under{' '}
            <code>
              assets/realty/&lt;purpose&gt;/YYYY/MM
            </code>
            . Then attach them to a property (gallery).
          </p>

          <MultiUploader
            division="realty"
            purpose="gallery"
            onUploaded={refreshAll}
          />
        </div>

        {/* attach assets to property */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">
            Attach uploaded URLs to a property
          </h4>
          <AttachToProperty
            properties={realtyProperties}
            onAfter={refreshAll}
          />
        </div>

        {/* seasonal rates */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">
            Manage Seasonal Rates for a Property
          </h4>
          <PropertyRatesPanel
            properties={realtyProperties}
          />
        </div>

        {/* test email */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">
            Send Test Itinerary Email
          </h4>
          <RealtyTestEmailPanelWithProperty />
        </div>

        {/* new property form */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">
            Create New Property
          </h4>
          <PropertyForm onCreated={refreshAll} />
        </div>

        {/* recent uploads */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">
            Recent Realty Uploads (gallery)
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="py-2">Preview</th>
                  <th>Filename</th>
                  <th>URL</th>
                  <th>Copy</th>
                </tr>
              </thead>
              <tbody>
                {realtyAssets.length > 0 ? (
                  realtyAssets.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b dark:border-gray-800 align-top"
                    >
                      <td className="py-2">
                        {a.file_type === 'image' ? (
                          <img
                            src={a.file_url}
                            className="w-16 h-16 object-cover rounded"
                            alt=""
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2">
                        {a.filename || '—'}
                      </td>
                      <td className="py-2 max-w-[280px] truncate">
                        {a.file_url}
                      </td>
                      <td className="py-2">
                        <button
                          className="text-blue-600 underline"
                          type="button"
                          onClick={() =>
                            copyText(a.file_url)
                          }
                        >
                          Copy URL
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="py-6 opacity-70"
                      colSpan={4}
                    >
                      No realty uploads yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs opacity-60 mt-2">
            Tip: copy a few URLs, paste them into the property
            gallery editor below.
          </p>
        </div>

        {/* property list / editor */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">
            Your Properties (Most Recent First)
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="py-2">Name</th>
                  <th>Slug</th>
                  <th>Base Price</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Cover &amp; Metadata</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {realtyProperties.length > 0 ? (
                  realtyProperties.map((propRow) => {
                    const row =
                      edits[propRow.id] || {};
                    const coverPreview =
                      row.cover_url ??
                      propRow.metadata?.cover_url ??
                      '';

                    return (
                      <React.Fragment
                        key={propRow.id}
                      >
                        <tr className="border-b dark:border-gray-800 align-top">
                          {/* name */}
                          <td className="py-2 min-w-[180px]">
                            <input
                              className="w-full dark:bg-gray-800"
                              placeholder={
                                propRow.name ||
                                ''
                              }
                              value={
                                row.name ??
                                propRow.name ??
                                ''
                              }
                              onChange={(e) =>
                                setEdits(
                                  (prev) => ({
                                    ...prev,
                                    [propRow.id]:
                                      {
                                        ...prev[
                                          propRow
                                            .id
                                        ],
                                        name: e
                                          .target
                                          .value,
                                      },
                                  })
                                )
                              }
                            />
                          </td>

                          {/* slug */}
                          <td className="py-2 min-w-[160px]">
                            <input
                              className="w-full dark:bg-gray-800"
                              placeholder={
                                propRow.slug ||
                                ''
                              }
                              value={
                                row.slug ??
                                propRow.slug ??
                                ''
                              }
                              onChange={(e) =>
                                setEdits(
                                  (prev) => ({
                                    ...prev,
                                    [propRow.id]:
                                      {
                                        ...prev[
                                          propRow
                                            .id
                                        ],
                                        slug: e
                                          .target
                                          .value,
                                      },
                                  })
                                )
                              }
                            />
                            <div className="text-[10px] opacity-60">
                              /realty/
                              {row.slug ??
                                propRow.slug}
                            </div>
                          </td>

                          {/* price */}
                          <td className="py-2 min-w-[100px]">
                            <input
                              type="number"
                              className="w-full dark:bg-gray-800"
                              placeholder={String(
                                propRow.price ??
                                  ''
                              )}
                              value={
                                row.price ??
                                propRow.price ??
                                ''
                              }
                              onChange={(e) =>
                                setEdits(
                                  (prev) => ({
                                    ...prev,
                                    [propRow.id]:
                                      {
                                        ...prev[
                                          propRow
                                            .id
                                        ],
                                        price: e
                                          .target
                                          .value,
                                      },
                                  })
                                )
                              }
                            />
                          </td>

                          {/* status */}
                          <td className="py-2 min-w-[120px]">
                            <input
                              className="w-full dark:bg-gray-800"
                              placeholder={
                                propRow.status ||
                                'active'
                              }
                              value={
                                row.status ??
                                propRow.status ??
                                ''
                              }
                              onChange={(e) =>
                                setEdits(
                                  (prev) => ({
                                    ...prev,
                                    [propRow.id]:
                                      {
                                        ...prev[
                                          propRow
                                            .id
                                        ],
                                        status:
                                          e
                                            .target
                                            .value,
                                      },
                                  })
                                )
                              }
                            />
                          </td>

                          {/* description */}
                          <td className="py-2 min-w-[260px]">
                            <textarea
                              className="w-full h-24 dark:bg-gray-800"
                              placeholder="Description"
                              value={
                                row
                                  .description ??
                                propRow
                                  .description ??
                                ''
                              }
                              onChange={(e) =>
                                setEdits(
                                  (prev) => ({
                                    ...prev,
                                    [propRow.id]:
                                      {
                                        ...prev[
                                          propRow
                                            .id
                                        ],
                                        description:
                                          e
                                            .target
                                            .value,
                                      },
                                  })
                                )
                              }
                            />
                          </td>

                          {/* metadata / cover */}
                          <td className="py-2 min-w-[320px]">
                            <div className="mb-2 flex gap-2 items-start">
                              <div className="w-16 h-16 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">
                                {coverPreview ? (
                                  <img
                                    src={
                                      coverPreview
                                    }
                                    className="w-full h-full object-cover"
                                    alt="cover"
                                  />
                                ) : (
                                  'no img'
                                )}
                              </div>

                              <div className="flex-1">
                                <label className="block text-[11px] opacity-60 mb-1">
                                  Cover URL (card /
                                  hero image)
                                </label>
                                <input
                                  className="w-full dark:bg-gray-800 text-xs"
                                  placeholder="https://.../your-image.webp"
                                  value={
                                    coverPreview
                                  }
                                  onChange={(e) =>
                                    setEdits(
                                      (prev) => ({
                                        ...prev,
                                        [propRow.id]:
                                          {
                                            ...prev[
                                              propRow
                                                .id
                                            ],
                                            cover_url:
                                              e
                                                .target
                                                .value,
                                          },
                                      })
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <textarea
                              className="w-full h-24 dark:bg-gray-800 text-xs"
                              placeholder='{"location":"Big Bear, CA","ical_urls":["https://..."],"cover_url":"https://..."}'
                              value={
                                row
                                  .metadataStr ??
                                JSON.stringify(
                                  propRow
                                    .metadata ||
                                    {},
                                  null,
                                  0
                                )
                              }
                              onChange={(e) =>
                                setEdits(
                                  (prev) => ({
                                    ...prev,
                                    [propRow.id]:
                                      {
                                        ...prev[
                                          propRow
                                            .id
                                        ],
                                        metadataStr:
                                          e
                                            .target
                                            .value,
                                      },
                                  })
                                )
                              }
                            />

                            <div className="text-[10px] opacity-60 mt-1">
                              location,
                              cover_url,
                              ical_urls all
                              live in
                              metadata.
                            </div>
                          </td>

                          {/* actions */}
                          <td className="py-2 min-w-[100px] space-y-2">
                            <button
                              className="px-3 py-1 bg-blue-600 text-white rounded w-full"
                              onClick={() =>
                                saveProperty(
                                  propRow
                                )
                              }
                            >
                              Save
                            </button>

                            <button
                              className="px-3 py-1 bg-gray-700 text-white rounded w-full"
                              onClick={() =>
                                toggleGalleryEditor(
                                  propRow
                                )
                              }
                            >
                              {openGalleryFor ===
                              propRow.id
                                ? 'Close Gallery'
                                : 'Gallery'}
                            </button>
                          </td>
                        </tr>

                        {openGalleryFor ===
                          propRow.id && (
                          <tr className="border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
                            <td
                              colSpan={7}
                              className="p-4"
                            >
                              {/* gallery editor block */}
                              <div className="space-y-4">
                                <div className="text-sm font-semibold">
                                  Property Gallery (
                                  {galleryDrafts[
                                    propRow
                                      .id
                                  ]?.length || 0}{' '}
                                  images)
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                                  {(
                                    galleryDrafts[
                                      propRow
                                        .id
                                    ] || []
                                  ).map(
                                    (
                                      url,
                                      idx
                                    ) => (
                                      <div
                                        key={
                                          idx
                                        }
                                        className="relative border rounded overflow-hidden bg-gray-200 dark:bg-gray-800"
                                      >
                                        <img
                                          src={
                                            url
                                          }
                                          className="w-full h-24 object-cover"
                                          alt={`img-${idx}`}
                                        />
                                        <button
                                          className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded"
                                          onClick={() =>
                                            removeGalleryImage(
                                              propRow.id,
                                              idx
                                            )
                                          }
                                          title="Remove this image from gallery"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    )
                                  )}

                                  {(
                                    galleryDrafts[
                                      propRow
                                        .id
                                    ] || []
                                  ).length ===
                                    0 && (
                                    <div className="text-xs text-gray-500 col-span-full">
                                      No
                                      images
                                      yet.
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <label className="block text-xs opacity-70">
                                    Add
                                    image
                                    URLs
                                    (comma
                                    or
                                    newline
                                    separated).
                                    Paste
                                    from
                                    “Recent
                                    Realty
                                    Uploads”
                                    or
                                    wherever.
                                  </label>

                                  <textarea
                                    className="w-full h-20 text-xs dark:bg-gray-800 border rounded p-2"
                                    value={
                                      newGalleryInput[
                                        propRow
                                          .id
                                      ] ||
                                      ''
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      setNewGalleryInput(
                                        (
                                          prev
                                        ) => ({
                                          ...prev,
                                          [propRow.id]:
                                            e
                                              .target
                                              .value,
                                        })
                                      )
                                    }
                                    placeholder={`https://.../photo1.webp\nhttps://.../photo2.webp`}
                                  />

                                  <button
                                    className="px-3 py-1 bg-gray-800 text-white rounded text-sm"
                                    type="button"
                                    onClick={() =>
                                      addGalleryImages(
                                        propRow.id
                                      )
                                    }
                                  >
                                    Add to
                                    Gallery
                                  </button>
                                </div>

                                <div>
                                  <button
                                    className="px-4 py-2 bg-green-600 text-white rounded text-sm"
                                    type="button"
                                    onClick={() =>
                                      saveGallery(
                                        propRow
                                      )
                                    }
                                  >
                                    Save
                                    Gallery
                                    Changes
                                  </button>
                                </div>

                                <div className="text-[10px] opacity-60 leading-relaxed">
                                  First
                                  image
                                  in
                                  this
                                  list
                                  shows
                                  as
                                  the
                                  big
                                  hero
                                  on
                                  the
                                  property
                                  page.
                                  Reorder
                                  by
                                  removing
                                  and
                                  re-adding
                                  (drag-and-drop
                                  later).
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      className="py-6 opacity-70"
                      colSpan={7}
                    >
                      No properties yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
