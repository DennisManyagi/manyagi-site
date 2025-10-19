// lib/printful.js
import axios from 'axios';

const PRINTFUL_API = 'https://api.printful.com';

export async function createPrintfulOrder({
  externalId,            // e.g., Stripe session id
  recipient,             // { name, address1, city, state_code, country_code, zip, phone, email }
  items,                 // [{ sync_variant_id, quantity }]
  packingSlip = {},      // optional
}) {
  if (!process.env.PRINTFUL_API_KEY) {
    throw new Error('PRINTFUL_API_KEY is not set');
  }

  const headers = {
    Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const payload = {
    external_id: externalId,
    recipient,
    items,
    packing_slip: packingSlip,
  };

  const { data } = await axios.post(`${PRINTFUL_API}/orders`, payload, { headers });
  return data?.result || data;
}
