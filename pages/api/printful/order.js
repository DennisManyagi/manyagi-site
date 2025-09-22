// pages/api/printful/order.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, customer } = req.body; // customer from Stripe metadata

  if (!customer.address1 || !customer.city) {
    return res.status(400).json({ error: 'Missing customer address' });
  }

  try {
    const response = await fetch('https://api.printful.com/v2/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: customer,
        items: items.filter(i => i.productType === 'merch').map(item => ({
          variant_id: item.variantId,
          quantity: item.quantity,
          name: item.name,
          retail_price: item.price.toString(),
        })),
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    res.status(200).json({ orderId: data.result.id });
  } catch (error) {
    console.error('Printful API error:', error);
    res.status(500).json({ error: error.message });
  }
}