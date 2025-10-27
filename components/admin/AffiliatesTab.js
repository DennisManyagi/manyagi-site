// components/admin/AffiliatesTab.js
import React, { useMemo } from 'react';
import SectionCard from '@/components/admin/SectionCard';
import AffiliatesForm from '@/components/admin/AffiliatesForm';
import { supabase } from '@/lib/supabase';

// tiny util
const currency = (n) => {
  const num = Number(n || 0);
  return `$${num.toFixed(2)}`;
};

export default function AffiliatesTab({
  affiliates,
  orders = [],
  reservations = [],
  refreshAll,
}) {
  // Build a lookup so we can aggregate earnings per affiliate
  // We consider two revenue sources:
  // 1. Normal/digital/merch orders in `orders`
  // 2. Realty bookings in `realty_reservations`
  //
  // We only count rows that are "paid".
  // For orders: status === 'paid'
  // For reservations: status === 'paid'
  //
  // We sum:
  // - total revenue attributed
  // - total commission saved on each row (commission_amount)
  //
  // NOTE: commission_amount is already calculated and stored when
  // the checkout session was created. We're just summing it here.

  const affiliateStats = useMemo(() => {
    const stats = {};

    // helper to init stats row
    function ensure(id) {
      if (!stats[id]) {
        stats[id] = {
          revenue: 0,
          commission: 0,
        };
      }
    }

    // 1) aggregate normal product orders
    orders.forEach((o) => {
      if ((o.status || '').toLowerCase() !== 'paid') return;
      if (!o.affiliate_id) return; // only count if attributed
      ensure(o.affiliate_id);

      // total_amount is assumed to be the total charged (before tax/shipping or after?)
      // We're just summing what you stored.
      stats[o.affiliate_id].revenue += Number(o.total_amount || 0);

      // commission_amount numeric(12,2)
      stats[o.affiliate_id].commission += Number(o.commission_amount || 0);
    });

    // 2) aggregate realty reservations
    reservations.forEach((r) => {
      if ((r.status || '').toLowerCase() !== 'paid') return;
      if (!r.affiliate_id) return;
      ensure(r.affiliate_id);

      // amount_cents is in cents; convert to dollars
      const amountDollars = Number(r.amount_cents || 0) / 100;
      stats[r.affiliate_id].revenue += amountDollars;

      // commission_amount for reservations we stored in dollars already
      stats[r.affiliate_id].commission += Number(r.commission_amount || 0);
    });

    return stats;
  }, [orders, reservations]);

  return (
    <SectionCard title="Affiliates Division">
      {/* create new affiliate */}
      <AffiliatesForm onCreated={refreshAll} />

      {/* list affiliates with performance */}
      <div className="mt-6">
        <h3 className="font-semibold mb-3">Affiliates</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="text-left border-b dark:border-gray-700">
                <th className="py-2">Name</th>
                <th>Referral Code</th>
                <th>Rate</th>
                <th>Referred Revenue (paid)</th>
                <th>Commission Owed</th>
                <th>Metadata</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {affiliates.map((aff) => {
                const stat = affiliateStats[aff.id] || {
                  revenue: 0,
                  commission: 0,
                };
                return (
                  <tr
                    key={aff.id}
                    className="border-b dark:border-gray-800 align-top"
                  >
                    <td className="py-2 font-semibold">{aff.name}</td>

                    <td className="py-2 text-xs">
                      <div className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                        {aff.referral_code}
                      </div>
                    </td>

                    <td className="py-2">
                      {(Number(aff.commission_rate || 0) * 100).toFixed(1)}%
                    </td>

                    <td className="py-2 whitespace-nowrap">
                      {currency(stat.revenue)}
                    </td>

                    <td className="py-2 whitespace-nowrap text-green-600 font-semibold">
                      {currency(stat.commission)}
                    </td>

                    <td className="py-2 min-w-[200px]">
                      <textarea
                        className="w-full h-16 dark:bg-gray-800 text-[11px]"
                        value={JSON.stringify(aff.metadata || {}, null, 0)}
                        readOnly
                      />
                    </td>

                    <td className="py-2">
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                        onClick={async () => {
                          if (!confirm('Delete this affiliate?')) return;
                          const { error } = await supabase
                            .from('affiliates')
                            .delete()
                            .eq('id', aff.id);
                          if (error) {
                            alert(`Delete failed: ${error.message}`);
                          } else {
                            refreshAll?.();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}

              {affiliates.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 opacity-70 text-center">
                    No affiliates yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] opacity-60 mt-4 leading-relaxed">
          Referred Revenue = sum of paid Orders + paid Realty bookings
          attributed to this affiliate.
          Commission Owed = sum of commission_amount we stored at checkout.
        </p>
      </div>
    </SectionCard>
  );
}
