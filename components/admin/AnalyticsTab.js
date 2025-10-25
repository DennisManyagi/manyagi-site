// components/admin/AnalyticsTab.js
import React, { useMemo } from 'react';
import SectionCard from '@/components/admin/SectionCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { isWithinLastDays } from '@/lib/adminUtils';

export default function AnalyticsTab({ users, orders }) {
  // revenue by division (last 30d)
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

  // naive user growth per month
  const userGrowth = useMemo(() => {
    const growthMap = users.reduce((acc, u) => {
      const created = new Date(u.created_at || Date.now());
      const monthLabel = created.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      acc[monthLabel] = (acc[monthLabel] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(growthMap)
      .map(([month, count]) => ({ month, count }))
      .sort(
        (a, b) =>
          new Date(a.month + ' 1').getTime() -
          new Date(b.month + ' 1').getTime()
      );
  }, [users]);

  return (
    <SectionCard title="Analytics Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Division */}
        <div>
          <h3 className="font-semibold mb-3">Revenue by Division</h3>
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
        </div>

        {/* User Growth */}
        <div>
          <h3 className="font-semibold mb-3">User Growth</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
