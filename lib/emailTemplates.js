// lib/emailTemplates.js

export function itineraryEmailHTML({
  type = 'itinerary', // NEW: 'itinerary' or 'receipt'
  kicker = 'Manyagi Realty',
  title = type === 'receipt' ? 'Your Booking Receipt' : 'Your Itinerary Quote',
  propertyName = 'Manyagi Realty Property',
  guestName = 'Guest',
  checkin,
  checkout,
  guests = '',
  icsUrl = '',
  detailsUrl = '',
  supportEmail = 'realty@manyagi.net',
}) {
  return `
  <div style="background:#f6f7fb;padding:24px">
    <table role="presentation" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
      <tr>
        <td style="background:#111827;padding:20px 24px;color:#fff">
          <div style="font-size:18px;font-weight:700">${kicker}</div>
          <div style="opacity:.85;font-size:12px;margin-top:2px">${title}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px">
          <h1 style="font-size:20px;margin:0 0 12px 0;color:#111827">Hi ${guestName},</h1>
          <p style="margin:0 0 16px 0;color:#374151;line-height:1.55">
            Here’s your ${type === 'receipt' ? 'receipt' : 'itinerary quote'} for <strong>${propertyName}</strong>.
          </p>

          <table role="presentation" style="width:100%;border:1px solid #e5e7eb;border-radius:8px;margin:16px 0">
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">
                <div style="font-size:12px;color:#6b7280;margin-bottom:2px">Check-in</div>
                <div style="font-size:14px;color:#111827">${checkin}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">
                <div style="font-size:12px;color:#6b7280;margin-bottom:2px">Check-out</div>
                <div style="font-size:14px;color:#111827">${checkout}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 16px">
                <div style="font-size:12px;color:#6b7280;margin-bottom:2px">Guests</div>
                <div style="font-size:14px;color:#111827">${guests}</div>
              </td>
            </tr>
          </table>

          <div style="display:flex;gap:10px;margin-top:8px">
            <a href="${icsUrl}" style="background:#111827;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:600;display:inline-block">Add to Calendar</a>
            <a href="${detailsUrl}" style="background:#f3f4f6;color:#111827;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:600;display:inline-block">View Listing</a>
          </div>

          <p style="margin:20px 0 0 0;color:#6b7280;font-size:12px;line-height:1.55">
            Have questions? Reply to this email or contact us at
            <a href="mailto:${supportEmail}" style="color:#111827">${supportEmail}</a>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px">
          © ${new Date().getFullYear()} Manyagi Realty • All rights reserved.
        </td>
      </tr>
    </table>
  </div>
  `;
}