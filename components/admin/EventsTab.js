// components/admin/EventsTab.js
import React, { useState } from 'react';
import SectionCard from '@/components/admin/SectionCard';
import EventCalendar from '@/components/Calendar';
import { supabase } from '@/lib/supabase';

export default function EventsTab({ events, refreshAll }) {
  // lightweight local state for new event
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    division: 'site',
    metadataStr: '',
  });

  const createEvent = async () => {
    const payload = {
      title: draft.title,
      description: draft.description,
      start_date: draft.start_date,
      end_date: draft.end_date,
      division: draft.division || 'site',
      // safe parse metadataStr -> JSON or {}
      metadata: draft.metadataStr
        ? (() => {
            try {
              return JSON.parse(draft.metadataStr);
            } catch {
              return {};
            }
          })()
        : {},
    };

    const { error } = await supabase.from('events').insert(payload);
    if (error) {
      alert(`Create failed: ${error.message}`);
    } else {
      setDraft({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        division: 'site',
        metadataStr: '',
      });
      refreshAll?.();
      alert('Event created.');
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) alert(`Delete failed: ${error.message}`);
    else refreshAll?.();
  };

  return (
    <SectionCard title="Events Management">
      {/* Add Event Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input
          placeholder="Event Title"
          value={draft.title}
          onChange={(e) =>
            setDraft({ ...draft, title: e.target.value })
          }
        />

        <input
          type="datetime-local"
          placeholder="Start Date"
          value={draft.start_date}
          onChange={(e) =>
            setDraft({ ...draft, start_date: e.target.value })
          }
        />

        <input
          type="datetime-local"
          placeholder="End Date"
          value={draft.end_date}
          onChange={(e) =>
            setDraft({ ...draft, end_date: e.target.value })
          }
        />

        <select
          className="dark:bg-gray-800"
          value={draft.division}
          onChange={(e) =>
            setDraft({ ...draft, division: e.target.value })
          }
        >
          <option value="site">site</option>
          <option value="tech">tech</option>
          <option value="media">media</option>
          <option value="capital">capital</option>
          <option value="realty">realty</option>
        </select>

        <textarea
          className="md:col-span-2"
          placeholder="Description"
          value={draft.description}
          onChange={(e) =>
            setDraft({ ...draft, description: e.target.value })
          }
        />

        <textarea
          className="md:col-span-3 h-24 text-xs dark:bg-gray-800"
          placeholder='Metadata (JSON, optional) e.g. {"location":"123 Main St, LA"}'
          value={draft.metadataStr}
          onChange={(e) =>
            setDraft({ ...draft, metadataStr: e.target.value })
          }
        />

        <button
          type="button"
          onClick={createEvent}
          className="md:col-span-3 px-4 py-2 rounded bg-blue-600 text-white"
        >
          Add Event
        </button>
      </div>

      {/* Calendar */}
      <EventCalendar events={events} />

      {/* Event List */}
      <div className="mt-6">
        <h3 className="font-semibold mb-3">Events List</h3>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="py-2">Title</th>
              <th>Division</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {events.map((ev) => (
              <tr
                key={ev.id}
                className="border-b dark:border-gray-800"
              >
                <td className="py-2">{ev.title}</td>
                <td className="py-2">
                  {ev.division || 'site'}
                </td>
                <td className="py-2">
                  {ev.start_date
                    ? new Date(ev.start_date).toLocaleString()
                    : '—'}
                </td>
                <td className="py-2">
                  {ev.end_date
                    ? new Date(ev.end_date).toLocaleString()
                    : '—'}
                </td>
                <td className="py-2">
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => deleteEvent(ev.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 opacity-70">
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
