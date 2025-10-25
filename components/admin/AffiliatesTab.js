// components/admin/AffiliatesTab.js
import React from 'react';
import SectionCard from '@/components/admin/SectionCard';
import AffiliatesForm from '@/components/admin/AffiliatesForm';
import { supabase } from '@/lib/supabase';

export default function AffiliatesTab({ affiliates, refreshAll }) {
  return (
    <SectionCard title="Affiliates Division">
      <AffiliatesForm onCreated={refreshAll} />

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Affiliates</h3>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="py-2">Name</th>
              <th>Referral Code</th>
              <th>Commission Rate</th>
              <th>Metadata</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {affiliates.map((aff) => (
              <tr
                key={aff.id}
                className="border-b dark:border-gray-800 align-top"
              >
                <td className="py-2">{aff.name}</td>
                <td className="py-2">{aff.referral_code}</td>
                <td className="py-2">{aff.commission_rate * 100}%</td>
                <td className="py-2 min-w-[200px]">
                  <textarea
                    className="w-full h-16 dark:bg-gray-800"
                    value={JSON.stringify(aff.metadata || {}, null, 0)}
                    readOnly
                  />
                </td>
                <td className="py-2">
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={async () => {
                      if (!confirm('Delete this affiliate?')) return;
                      const { error } = await supabase
                        .from('affiliates')
                        .delete()
                        .eq('id', aff.id);
                      if (error)
                        alert(`Delete failed: ${error.message}`);
                      else {
                        refreshAll?.();
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {affiliates.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 opacity-70">
                  No affiliates yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
