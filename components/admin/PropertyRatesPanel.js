// components/admin/PropertyRatesPanel.js
import { useState, useEffect } from 'react';

function PropertyRatesPanel({ properties }) {
  const [selected, setSelected] = useState('');
  return (
    <div className="glass p-4 rounded">
      <div className="flex items-center gap-3 mb-3">
        <select
          className="dark:bg-gray-900"
          value={selected}
          onChange={(e)=>setSelected(e.target.value)}
        >
          <option value="">Select property…</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      {selected ? <RealtyRatesManager propertyId={selected} /> : <p className="opacity-70 text-sm">Choose a property to manage seasonal rates.</p>}
    </div>
  );
}

function RealtyRatesManager({ propertyId }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    nightly_rate: '',
    min_nights: '',
    priority: 0,
    notes: '',
  });
  const load = async () => {
    if (!propertyId) return;
    const r = await fetch(`/api/realty/rates?property_id=${encodeURIComponent(propertyId)}`);
    const j = await r.json();
    setItems(j.items || []);
  };
  useEffect(() => { load(); }, [propertyId]);

  const add = async () => {
    if (!form.start_date || !form.end_date || !form.nightly_rate) {
      alert('Start, end and nightly rate are required');
      return;
    }
    const r = await fetch('/api/realty/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId, ...form }),
    });
    const j = await r.json();
    if (!j.ok) return alert(j.error || 'Failed');
    setForm({ start_date: '', end_date: '', nightly_rate: '', min_nights: '', priority: 0, notes: '' });
    load();
  };
  const delItem = async (id) => {
    if (!confirm('Delete rate?')) return;
    const r = await fetch(`/api/realty/rates?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const j = await r.json();
    if (!j.ok) return alert(j.error || 'Failed');
    load();
  };

  return (
    <div className="mt-6 glass p-4 rounded">
      <h3 className="font-semibold mb-3">Seasonal / Holiday Rates</h3>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <input type="date" value={form.start_date} onChange={(e)=>setForm({...form,start_date:e.target.value})} />
        <input type="date" value={form.end_date} onChange={(e)=>setForm({...form,end_date:e.target.value})} />
        <input type="number" placeholder="Nightly $" value={form.nightly_rate} onChange={(e)=>setForm({...form,nightly_rate:e.target.value})}/>
        <input type="number" placeholder="Min nights" value={form.min_nights} onChange={(e)=>setForm({...form,min_nights:e.target.value})}/>
        <input type="number" placeholder="Priority (higher wins)" value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value})}/>
        <input placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/>
      </div>
      <button className="mt-3 px-3 py-2 rounded bg-blue-600 text-white" onClick={add}>Add Rate</button>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-800">
              <th className="py-2">Dates</th><th>Nightly</th><th>Min</th><th>Priority</th><th>Notes</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id} className="border-b dark:border-gray-900">
                <td className="py-2">{r.start_date} → {r.end_date}</td>
                <td className="py-2">${Number(r.nightly_rate).toFixed(2)}</td>
                <td className="py-2">{r.min_nights ?? '—'}</td>
                <td className="py-2">{r.priority ?? 0}</td>
                <td className="py-2">{r.notes || '—'}</td>
                <td className="py-2">
                  <button className="text-red-600" onClick={()=>delItem(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="py-4 opacity-70">No overrides yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PropertyRatesPanel;
