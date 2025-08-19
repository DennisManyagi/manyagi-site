import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { order_id } = req.query;

  if (!order_id) {
    return res.status(400).json({ error: 'Missing order_id' });
  }

  try {
    const response = await fetch(`https://api.printful.com/v2/orders/${order_id}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PRINTFUL_TOKEN}`,
      },
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    const orderDetails = {
      status: data.result.status,
      items: data.result.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
      })),
      shipment: data.result.shipments?.[0] || null,
    };

    res.status(200).json(orderDetails);
  } catch (error) {
    console.error('Printful API error:', error);
    res.status(500).json({ error: error.message });
  }
}