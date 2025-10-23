// lib/emails/itineraryEmail.js
import { sendEmail } from '../sendEmail';
import { itineraryEmailHTML } from '../emailTemplates';

export async function sendItineraryEmail({
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
    subject: `Your Itinerary for ${property}`,
    html,
    text: `Hello ${guestName},\n\nYour booking at ${property} from ${checkin} to ${checkout} for ${guests} guests is confirmed.\n\nThank you!`,
  });
}
