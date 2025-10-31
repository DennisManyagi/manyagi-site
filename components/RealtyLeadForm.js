import { useState } from 'react';

export default function RealtyLeadForm({ propertyId }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('buy'); // default
  const [notes, setNotes] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitLead = async (e) => {
    e.preventDefault();
    if (!name || !email || !interest) {
      setStatusMsg('Please fill required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setStatusMsg('');

      const res = await fetch('/api/realty/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          interest_type: interest,
          notes,
          property_id: propertyId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send');
      }

      // success
      setStatusMsg('Thanks — we’ll reach out.');
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
      setInterest('buy');
    } catch (err) {
      console.error('lead submit error:', err);
      setStatusMsg('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submitLead}
      className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded p-4 space-y-3 max-w-lg"
    >
      <h3 className="text-lg font-semibold">
        Talk to a Realty Specialist
      </h3>
      <p className="text-sm opacity-80 -mt-2">
        California residential, commercial, or property management.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">
          I'm looking to…
        </label>
        <select
          className="w-full border rounded px-3 py-2 dark:bg-gray-800"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
        >
          <option value="buy">Buy property</option>
          <option value="sell">Sell my property</option>
          <option value="manage">Get my rental managed</option>
          <option value="rental_inquiry">Ask about a stay</option>
          <option value="other">Other / Not sure yet</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Your name *
        </label>
        <input
          className="w-full border rounded px-3 py-2 dark:bg-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Email *
        </label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2 dark:bg-gray-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Phone
        </label>
        <input
          className="w-full border rounded px-3 py-2 dark:bg-gray-800"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Notes
        </label>
        <textarea
          className="w-full border rounded px-3 py-2 dark:bg-gray-800 h-24"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tell us what you're looking for. Timeline, budget, area..."
        />
      </div>

      <button
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-500 disabled:opacity-50"
      >
        {submitting ? 'Sending…' : 'Get in Touch'}
      </button>

      {statusMsg && (
        <p className="text-sm text-center pt-2">{statusMsg}</p>
      )}

      <p className="text-[10px] opacity-60 text-center">
        No spam. We only contact you about this request.
      </p>
    </form>
  );
}
