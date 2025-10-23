// lib/emails/itineraryEmail.js
import { sendEmail } from '../sendEmail';
import { itineraryEmailHTML } from '../emailTemplates';

export async function sendItineraryEmail({
  type = 'itinerary', // NEW: 'itinerary' or 'receipt'
  guestName = 'Guest',
  to = '',
  property = 'Manyagi Realty Property',
  checkin,
  checkout,
  guests = '',
  replyTo = 'realty@manyagi.net',
  snapshot = {},
}) {
  // Generate HTML using the template
  const html = itineraryEmailHTML({
    type, // Pass to template for customizations
    guestName,
    to,
    property,
    checkin,
    checkout,
    guests,
    replyTo,
    snapshot,
  });

  // Send the email
  return await sendEmail({
    to,
    subject: type === 'receipt' ? `Booking Receipt for ${property}` : `Your Itinerary for ${property}`,
    html,
    text: `Hello ${guestName},\n\nYour booking at ${property} from ${checkin} to ${checkout} for ${guests} guests is confirmed.\n\nThank you!`,
  });
}