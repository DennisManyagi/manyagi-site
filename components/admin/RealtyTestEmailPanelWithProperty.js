// components/admin/RealtyTestEmailPanelWithProperty.js
import { useState } from 'react';
import axios from 'axios';

function RealtyTestEmailPanelWithProperty() {
  // Assume fetching properties or use context; for stub, empty
  return <RealtyTestEmailPanel properties={[]} />;
}

function RealtyTestEmailPanel({ properties }) {
  const [selected, setSelected] = useState('');
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_TEST_EMAIL || '');
  const [busy, setBusy] = useState(false);

  const sendTest = async () => {
    if (!selected) return alert('Select a property');
    if (!email) return alert('Enter an email');
    setBusy(true);
    try {
      const { data } = await axios.post('/api/realty/test-email', { property_id: selected, email });
      alert(data.message || 'Sent!');
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass p-4 rounded">
      <select value={selected} onChange={e => setSelected(e.target.value)} className="dark:bg-gray-800">
        <option value="">Select property</option>
        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Test email" className="dark:bg-gray-800" />
      <button onClick={sendTest} disabled={busy} className="px-4 py-2 rounded bg-blue-600 text-white">
        {busy ? 'Sending...' : 'Send Test Email'}
      </button>
    </div>
  );
}

export default RealtyTestEmailPanelWithProperty;