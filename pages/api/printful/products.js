import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://api.printful.com/v2/store/products', {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PRINTFUL_TOKEN}`,
      },
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    // Map Printful products to your frontend format
    const products = data.result.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.variants[0].retail_price || '0'), // Use first variant's price
      image: product.thumbnail_url,
      variantId: product.variants[0].id, // Use first variant for simplicity
    }));

    res.status(200).json(products);
  } catch (error) {
    console.error('Printful API error:', error);
    res.status(500).json({ error: error.message });
  }
}