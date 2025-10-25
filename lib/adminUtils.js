// lib/adminUtils.js
import { supabase } from '@/lib/supabase';

// turn "a, b, c" into ["a","b","c"] unique
export const toArrayTags = (s) =>
  Array.from(
    new Set(
      String(s || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );

export const safeJSON = (s, fallback = {}) => {
  try {
    if (!s) return fallback;
    if (typeof s === 'object') return s;
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

export const copyText = async (txt) => {
  try {
    await navigator.clipboard.writeText(txt);
    alert('Copied!');
  } catch {
    // ignore clipboard errors silently
  }
};

export const currency = (n) => {
  const num = Number(n || 0);
  return `$${num.toFixed(2)}`;
};

export const isWithinLastDays = (iso, days = 30) => {
  if (!iso) return false;
  const d = new Date(iso);
  const since = new Date();
  since.setDate(since.getDate() - days);
  return d >= since;
};

// generic row updater
export const updateRow = async (table, id, payload) => {
  const { error } = await supabase.from(table).update(payload).eq('id', id);
  if (error) throw error;
};

// products-specific convenience
export const updateProduct = async (id, payload) => {
  await updateRow('products', id, payload);
};

// delete product w/ confirm
export const deleteProduct = async (id, refreshAll) => {
  if (!confirm('Delete this product?')) return;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    alert(`Delete failed: ${error.message}`);
  } else {
    refreshAll?.();
    alert('Product deleted.');
  }
};

// generic delete for any table
export const deleteRow = async (
  table,
  id,
  refreshAll,
  confirmMsg = 'Delete this?'
) => {
  if (!confirm(confirmMsg)) return;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    alert(`Delete failed: ${error.message}`);
  } else {
    refreshAll?.();
    alert('Deleted.');
  }
};
