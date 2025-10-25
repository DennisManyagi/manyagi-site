// components/admin/UsersTab.js
import React from 'react';
import SectionCard from '@/components/admin/SectionCard';
import { supabase } from '@/lib/supabase';

export default function UsersTab({ users, refreshAll }) {
  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role to ${newRole} for this user?`)) return;
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);
    if (error) alert(`Failed to update role: ${error.message}`);
    else refreshAll?.();
  };

  return (
    <SectionCard title="Users Management">
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="py-2">Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b dark:border-gray-800"
              >
                <td className="py-2">{u.email}</td>
                <td className="py-2">{u.role || 'user'}</td>
                <td className="py-2">
                  {new Date(u.created_at).toLocaleString()}
                </td>
                <td className="py-2">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => toggleUserRole(u.id, u.role)}
                  >
                    Toggle Role
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 opacity-70">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
