import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, customer } = req.body;

  try {
    const response = await fetch('https://api.printful.com/v2/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PRINTFUL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: {
          name: customer.name,
          address1: customer.address,
          city: customer.city,
          state_code: customer.state,
          country_code: customer.country,
          zip: customer.zip,
        },
        items: items.map(item => ({
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

    // Save to Firestore (optional, for tracking)
    // const db = admin.firestore();
    // await db.collection('orders').add({ printfulOrderId: data.result.id, items, customer });

    res.status(200).json({ orderId: data.result.id });
  } catch (error) {
    console.error('Printful API error:', error);
    res.status(500).json({ error: error.message });
  }
}