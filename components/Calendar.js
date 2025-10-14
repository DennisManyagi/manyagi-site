// components/Calendar.js
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US'; // Added import
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS } // Added locales
});

export default function EventCalendar({ events }) {
  const formattedEvents = events.map(event => ({
    title: event.title,
    start: new Date(event.date),
    end: new Date(event.date),
    allDay: true,
  }));

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        className="bg-white dark:bg-gray-800 p-4 rounded glass"
      />
    </div>
  );
}