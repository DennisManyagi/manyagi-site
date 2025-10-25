// components/admin/OverviewTab.js
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import SectionCard from '@/components/admin/SectionCard';
import { currency, isWithinLastDays } from '@/lib/adminUtils';

export default function OverviewTab({ orders, subscriptions, users }) {
  const kpis = useMemo(() => {
    const last30Orders = orders.filter((o) =>
      isWithinLastDays(o.created_at, 30)
    );
    const revenueL30 = last30Orders.reduce(
      (acc, o) => acc + Number(o.total_amount || 0),
      0
    );
    const ordersL30 = last30Orders.length;
    const subsActive = subscriptions.filter(
      (s) => (s.status || '').toLowerCase() === 'active'
    ).length;
    return {
      revenueL30,
      ordersL30,
      subsActive,
      users: users.length,
    };
  }, [orders, subscriptions, users]);

  const revenueByDivision = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (!isWithinLastDays(o.created_at, 30)) return;
      const d = (o.division || 'site').toLowerCase();
      map[d] = (map[d] || 0) + Number(o.total_amount || 0);
    });
    return Object.entries(map).map(([division, total]) => ({
      division,
      total,
    }));
  }, [orders]);

  return (
    <>
      <SectionCard title="Key Metrics (Last 30 Days)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="text-sm opacity-70">Revenue</div>
            <div className="text-2xl font-bold">
              {currency(kpis.revenueL30)}
            </div>
          </div>

          <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="text-sm opacity-70">Orders</div>
            <div className="text-2xl font-bold">{kpis.ordersL30}</div>
          </div>

          <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="text-sm opacity-70">Active Subs</div>
            <div className="text-2xl font-bold">{kpis.subsActive}</div>
          </div>

          <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="text-sm opacity-70">Users</div>
            <div className="text-2xl font-bold">{kpis.users}</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Revenue by Division (Last 30 Days)">
        {revenueByDivision.length === 0 ? (
          <p className="opacity-70">No orders in the last 30 days.</p>
        ) : (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByDivision}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="division" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>
    </>
  );
}
