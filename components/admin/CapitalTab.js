// components/admin/CapitalTab.js
import React, { useState, useEffect } from 'react';
import CapitalProductForm from '@/components/admin/CapitalProductForm';
import SectionCard from '@/components/admin/SectionCard';
import {
  toArrayTags,
  safeJSON,
  updateProduct,
  deleteProduct,
} from '@/lib/adminUtils';
import { supabase } from '@/lib/supabase';

const FOUNDATION_MARKETS = ['stocks', 'crypto', 'forex'];

export default function CapitalTab({ products: allProducts, refreshAll }) {
  const [edits, setEdits] = useState({});

  // products filtered to capital division
  const capitalProducts = (allProducts || []).filter(
    (p) => p.division === 'capital'
  );

  // ---------- FOUNDATIONS IMAGES STATE ----------
  const [foundationImages, setFoundationImages] = useState({
    stocks: '',
    crypto: '',
    forex: '',
  });
  const [foundationSaving, setFoundationSaving] = useState(false);

  // map existing foundation-image rows by market
  const foundationRowsByMarket = {};
  capitalProducts.forEach((p) => {
    const role = p.metadata?.role;
    const market = p.metadata?.market;
    if (
      role === 'foundation-image' &&
      FOUNDATION_MARKETS.includes(market)
    ) {
      foundationRowsByMarket[market] = p;
    }
  });

  // hydrate inputs from existing rows whenever capitalProducts change
  useEffect(() => {
    const next = { stocks: '', crypto: '', forex: '' };

    FOUNDATION_MARKETS.forEach((m) => {
      const row = foundationRowsByMarket[m];
      if (row) {
        next[m] =
          row.thumbnail_url ||
          row.display_image ||
          '';
      }
    });

    setFoundationImages(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProducts?.length]);

  const saveFoundations = async () => {
    try {
      setFoundationSaving(true);

      const payloads = FOUNDATION_MARKETS.map((market) => {
        const url = (foundationImages[market] || '').trim();
        if (!url) return null;

        const existing = foundationRowsByMarket[market];

        const base = {
          division: 'capital',
          name:
            market === 'stocks'
              ? 'Foundation — Stocks'
              : market === 'crypto'
              ? 'Foundation — Crypto'
              : 'Foundation — Forex',
          thumbnail_url: url,
          display_image: url,
          price: 0,
          description: `Hero image used for the ${market} foundation card on /capital.`,
          tags: ['foundation', market],
          metadata: {
            role: 'foundation-image',
            market,
          },
        };

        return existing ? { ...base, id: existing.id } : base;
      }).filter(Boolean);

      if (!payloads.length) {
        alert('Add at least one image URL before saving.');
        return;
      }

      const { error } = await supabase.from('products').upsert(payloads);
      if (error) throw error;

      await refreshAll?.();
      alert('Foundation images saved.');
    } catch (e) {
      console.error(e);
      alert(`Failed to save foundation images: ${e.message}`);
    } finally {
      setFoundationSaving(false);
    }
  };

  // ---------- SUBSCRIPTIONS DASHBOARD ----------
  const [subsLoading, setSubsLoading] = useState(true);
  const [subsError, setSubsError] = useState('');
  const [subsRows, setSubsRows] = useState([]);
  const [mrr, setMrr] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setSubsLoading(true);
        const r = await fetch('/api/capital/subscriptions-admin');
        const j = await r.json();
        if (!j.ok) {
          setSubsError(j.error || 'failed to load subscriptions');
        } else {
          setSubsError('');
          setSubsRows(j.subs || []);
          setMrr(j.mrr || 0);
        }
      } catch (e) {
        setSubsError(e.message || 'error');
      } finally {
        setSubsLoading(false);
      }
    })();
  }, []);

  // ---------- EDIT EXISTING PRODUCTS ----------
  const buildPayload = (row, p) => ({
    ...(row.thumbnail_url !== undefined
      ? { thumbnail_url: row.thumbnail_url }
      : {}),
    ...(row.price !== undefined
      ? { price: parseFloat(row.price || 0) }
      : {}),
    ...(row.tagsStr !== undefined
      ? { tags: toArrayTags(row.tagsStr) }
      : {}),
    ...(row.description !== undefined
      ? { description: row.description }
      : {}),
    ...(row.metadata !== undefined
      ? { metadata: safeJSON(row.metadata, p.metadata || {}) }
      : {}),
  });

  const save = async (p) => {
    try {
      const row = edits[p.id] || {};
      if (!Object.keys(row).length) return;
      const payload = buildPayload(row, p);
      await updateProduct(p.id, payload);
      setEdits((prev) => ({ ...prev, [p.id]: {} }));
      refreshAll?.();
      alert('Saved.');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Capital Division">
      {/* 0. FOUNDATION IMAGES (STOCKS/CRYPTO/FOREX) */}
      <div className="space-y-2 mb-8">
        <h3 className="text-xl font-bold">
          Foundation Images (Stocks / Crypto / Forex)
        </h3>
        <p className="text-sm opacity-80">
          These images power the three market cards at the top of{' '}
          <code>/capital</code>. Paste Supabase URLs here and click
          &quot;Save Foundations&quot;. They&apos;re stored as special{' '}
          <code>products</code> rows with{' '}
          <code>metadata.role = "foundation-image"</code>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Stocks Image URL
            </label>
            <input
              className="w-full dark:bg-gray-800"
              placeholder="https://.../capital-stocks.webp"
              value={foundationImages.stocks}
              onChange={(e) =>
                setFoundationImages((prev) => ({
                  ...prev,
                  stocks: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Crypto Image URL
            </label>
            <input
              className="w-full dark:bg-gray-800"
              placeholder="https://.../capital-crypto.webp"
              value={foundationImages.crypto}
              onChange={(e) =>
                setFoundationImages((prev) => ({
                  ...prev,
                  crypto: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Forex Image URL
            </label>
            <input
              className="w-full dark:bg-gray-800"
              placeholder="https://.../capital-forex.webp"
              value={foundationImages.forex}
              onChange={(e) =>
                setFoundationImages((prev) => ({
                  ...prev,
                  forex: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <button
          type="button"
          onClick={saveFoundations}
          disabled={foundationSaving}
          className="mt-3 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
        >
          {foundationSaving ? 'Saving…' : 'Save Foundations'}
        </button>
      </div>

      {/* 1. ADD NEW PRODUCT */}
      <div className="space-y-2 mb-8 border-t pt-6">
        <h3 className="text-xl font-bold">Add Capital Product</h3>
        <p className="text-sm opacity-80">
          Use this to create signals tiers, bot licenses, and trading ebooks
          that show up in the Capital catalog on <code>/capital</code>.
        </p>

        <ul className="text-xs opacity-70 list-disc ml-5">
          <li>
            <strong>Signals tier</strong> — set license type to{' '}
            <code>Signals Tier</code>, price to your monthly price, and
            include metadata like:{' '}
            <code>
              {'{'}
              "productType":"subscription","plan_type":"Crypto
              Signals","stripe_price_id":"price_123"
              {'}'}
            </code>
            .
          </li>
          <li>
            <strong>Trading Playbook (PDF)</strong> — set license type{' '}
            <code>eBook (PDF)</code>, and include metadata like:{' '}
            <code>
              {'{'}
              "productType":"download","license_type":"ebook","format":"pdf"
              {'}'}
            </code>
            .
          </li>
        </ul>

        <CapitalProductForm onCreated={refreshAll} />
      </div>

      {/* 2. SUBS / REVENUE DASHBOARD */}
      <div className="border-t pt-6 mt-8">
        <h3 className="text-xl font-bold mb-2">
          Active Signals Subscribers
        </h3>

        {subsLoading ? (
          <div className="text-sm opacity-70">Loading subscribers…</div>
        ) : subsError ? (
          <div className="text-sm text-red-500">
            Failed to load: {subsError}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm">
              <div>
                <span className="font-semibold">Est. MRR: </span>${mrr.toFixed(
                  2
                )}{' '}
                / month
              </div>
              <div className="text-xs opacity-70">
                MRR is sum of plan_type prices (e.g. &quot;Basic Signals&quot; =
                $29.99).
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-gray-700">
                    <th className="py-2">Plan</th>
                    <th>Status</th>
                    <th>Telegram ID</th>
                    <th>Next Renewal</th>
                    <th>$/mo</th>
                  </tr>
                </thead>
                <tbody>
                  {subsRows.length > 0 ? (
                    subsRows.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b dark:border-gray-800"
                      >
                        <td className="py-2">{s.plan_type || '—'}</td>
                        <td className="py-2">{s.status || '—'}</td>
                        <td className="py-2">{s.telegram_id || '—'}</td>
                        <td className="py-2 text-xs">
                          {s.current_period_end || '—'}
                        </td>
                        <td className="py-2">
                          ${Number(s.amount_usd || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="py-4 opacity-70 text-xs"
                        colSpan={5}
                      >
                        No active subscribers yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 3. EDIT EXISTING PRODUCTS */}
      <div className="border-t pt-6 mt-8">
        <h3 className="font-semibold mb-3">Products (Capital)</h3>

        <p className="text-xs opacity-70 mb-2">
          Tip: Signals tiers should have{' '}
          <code>metadata.plan_type</code> (e.g. &quot;Crypto Signals&quot;). If
          they also have <code>metadata.productType = "subscription"</code>{' '}
          that&apos;s ideal, but the frontend will still treat them as
          subscriptions as long as <code>plan_type</code> is set.
        </p>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="py-2">Thumb</th>
              <th>Name</th>
              <th>Price</th>
              <th>Thumbnail URL</th>
              <th>Tags</th>
              <th>Description</th>
              <th>Metadata JSON</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {capitalProducts.length > 0 ? (
              capitalProducts.map((p) => {
                const row = edits[p.id] || {};
                return (
                  <tr
                    key={p.id}
                    className="border-b dark:border-gray-800 align-top"
                  >
                    <td className="py-2">
                      {p.thumbnail_url ? (
                        <img
                          src={p.thumbnail_url}
                          className="w-16 h-16 object-cover rounded"
                          alt=""
                        />
                      ) : null}
                    </td>

                    <td className="py-2">
                      <div className="font-semibold text-xs">
                        {p.name}
                      </div>
                      <div className="text-[10px] opacity-60">
                        {p.metadata?.productType ||
                          p.productType ||
                          '—'}
                      </div>
                    </td>

                    <td className="py-2 min-w-[100px]">
                      <input
                        type="number"
                        className="w-full dark:bg-gray-800"
                        value={row.price ?? (p.price ?? '')}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [p.id]: {
                              ...row,
                              price: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>

                    <td className="py-2 min-w-[220px]">
                      <input
                        className="w-full dark:bg-gray-800"
                        placeholder="thumbnail_url"
                        value={
                          row.thumbnail_url ??
                          p.thumbnail_url ??
                          ''
                        }
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [p.id]: {
                              ...row,
                              thumbnail_url: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>

                    <td className="py-2 min-w-[200px]">
                      <input
                        className="w-full dark:bg-gray-800"
                        placeholder="comma,separated,tags"
                        value={
                          row.tagsStr ??
                          (Array.isArray(p.tags)
                            ? p.tags.join(', ')
                            : '')
                        }
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [p.id]: {
                              ...row,
                              tagsStr: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>

                    <td className="py-2 min-w-[300px]">
                      <textarea
                        className="w-full h-20 dark:bg-gray-800"
                        placeholder="description"
                        value={
                          row.description ??
                          p.description ??
                          ''
                        }
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [p.id]: {
                              ...row,
                              description: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>

                    <td className="py-2 min-w-[300px]">
                      <textarea
                        className="w-full h-20 dark:bg-gray-800"
                        placeholder='{"productType":"subscription","plan_type":"Crypto Signals"}'
                        value={
                          row.metadata ??
                          JSON.stringify(p.metadata || {}, null, 0)
                        }
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [p.id]: {
                              ...row,
                              metadata: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>

                    <td className="py-2 space-x-2">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                        onClick={() => save(p)}
                      >
                        Save
                      </button>

                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded"
                        onClick={() =>
                          deleteProduct(p.id, refreshAll)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-6 opacity-70">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
