import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(_req, res) {
  try {
    const { data, error } = await supabaseAdmin.from('site_config').select('*');
    if (error) throw error;
    const map = (data || []).reduce((acc, row) => { acc[row.key] = row.value; return acc; }, {});
    res.status(200).json(map);
  } catch (e) {
    console.error('site-config error:', e);
    res.status(200).json({});
  }
}
