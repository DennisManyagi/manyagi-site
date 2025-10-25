// components/admin/BundlesTab.js
import React from 'react';
import SectionCard from '@/components/admin/SectionCard';
import BundlesForm from '@/components/admin/BundlesForm';
import { supabase } from '@/lib/supabase';
import { currency } from '@/lib/adminUtils';

export default function BundlesTab({ bundles, products, refreshAll }) {
  return (
    <SectionCard title="Bundles Division">
      <BundlesForm products={products} onCreated={refreshAll} />

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Bundles</h3>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="py-2">Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {bundles.map((bund) => (
              <tr
                key={bund.id}
                className="border-b dark:border-gray-800 align-top"
              >
                <td className="py-2">{bund.name}</td>
                <td className="py-2">{bund.description || '—'}</td>
                <td className="py-2">{currency(bund.price)}</td>
                <td className="py-2">
                  {Array.isArray(bund.product_ids)
                    ? bund.product_ids.length
                    : 0}{' '}
                  products
                </td>
                <td className="py-2">
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={async () => {
                      if (!confirm('Delete this bundle?')) return;
                      const { error } = await supabase
                        .from('bundles')
                        .delete()
                        .eq('id', bund.id);
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

            {bundles.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 opacity-70">
                  No bundles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
