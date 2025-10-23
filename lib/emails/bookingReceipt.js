// lib/emails/bookingReceipt.js
import { sendEmail } from '../sendEmail';
import { itineraryEmailHTML } from '../emailTemplates';

export async function sendBookingReceipt({
  type = 'receipt', // Use 'receipt' to customize template if needed
  guestName = 'Guest',
  to = '',
  property = 'Manyagi Realty Property',
  checkin,
  checkout,
  guests = '',
  replyTo = 'realty@manyagi.net',
  snapshot = {},
}) {
  // Generate HTML using the template (reusing existing for consistency)
  const html = itineraryEmailHTML({
    type,
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
    subject: `Booking Receipt for ${property}`,
    html,
    text: `Hello ${guestName},\n\nYour booking at ${property} from ${checkin} to ${checkout} for ${guests} guests is confirmed.\n\nThank you!`,
  });
}