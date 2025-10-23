// lib/realtyHelpers.js
import { supabaseAdmin } from './supabaseAdmin';

export async function isDateBlocked(propertyId, isoDate) {
  const { data: avail } = await supabaseAdmin.from('property_availability').select('status').eq('property_id', propertyId).eq('date', isoDate).maybeSingle();
  if (avail?.status === 'booked') return true;

  const { data: blocks } = await supabaseAdmin.from('realty_external_blocks').select('*').eq('property_id', propertyId);
  return (blocks || []).some(b => new Date(isoDate) >= new Date(b.starts_on) && new Date(isoDate) < new Date(b.ends_on));
}

export async function getRateForDate(propertyId, isoDate) {
  const { data: rates } = await supabaseAdmin.from('realty_rates').select('*').eq('property_id', propertyId).order('priority', { ascending: false });
  for (const r of rates || []) {
    if (new Date(isoDate) >= new Date(r.start_date) && new Date(isoDate) <= new Date(r.end_date)) {
      return r.nightly_rate;
    }
  }
  return null; // fallback to base price
}