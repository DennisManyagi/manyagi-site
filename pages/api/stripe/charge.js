const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { paymentMethodId, amount, description } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // in cents
        currency: 'usd',
        description,
        payment_method: paymentMethodId,
        confirm: true,
      });
      res.status(200).json({ success: true, paymentIntent });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};