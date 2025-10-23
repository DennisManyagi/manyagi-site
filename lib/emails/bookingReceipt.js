// lib/emails/bookingReceipt.js
import { sendEmail } from '../sendEmail';
import { itineraryEmailHTML } from '../emailTemplates'; // Reuse template or create a new one if needed

export async function sendBookingReceipt({
  guestName = 'Guest',
  to = '',
  property = 'Manyagi Realty Property',
  checkin,
  checkout,
  guests = '',
  replyTo = 'realty@manyagi.net',
  snapshot = {},
}) {
  // Generate HTML (reuse itinerary template for receipt; customize if needed)
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
    subject: `Booking Receipt for ${property}`,
    html,
    text: `Hello ${guestName},\n\nThis is your receipt for the booking at ${property} from ${checkin} to ${checkout}.\n\nThank you!`,
  });
}