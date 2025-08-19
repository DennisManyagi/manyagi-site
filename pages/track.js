import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Track() {
  const router = useRouter();
  const { order_id } = router.query;
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Auto-fill order ID from query parameter and fetch details
  useEffect(() => {
    if (order_id) {
      setOrderId(order_id);
      handleTrackOrder({ preventDefault: () => {} }); // Simulate form submission
    }
  }, [order_id]);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setOrderDetails(null);

    try {
      if (!orderId) {
        throw new Error('Please enter an order ID');
      }

      const response = await fetch(`/api/printful/track?order_id=${orderId}`);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setOrderDetails(data);
      setShowModal(true);
    } catch (err) {
      setError(err.message);
      setShowModal(true);
    }
  };

  return (
    <>
      <Head>
        <title>Track Your Order — Manyagi Designs</title>
        <meta name="description" content="Track your Manyagi Designs order status." />
        <meta property="og:title" content="Track Your Order — Manyagi Designs" />
        <meta property="og:description" content="Track your Manyagi Designs order status." />
        <meta property="og:image" content="https://manyagi.net/images/og-designs.jpg" />
        <meta property="og:url" content="https://manyagi.net/track" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-6">Track Your Order</h1>
        <p className="mb-6">Enter your order ID (from your confirmation email) to check the status of your purchase.</p>
        <form className="max-w-md mx-auto space-y-4" onSubmit={handleTrackOrder}>
          <div>
            <label htmlFor="orderId" className="block text-sm mb-1">
              Order ID *
            </label>
            <input
              type="text"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="e.g., 12345678"
              required
            />
          </div>
          <button
            type="submit"
            className="btn w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            Track Order
          </button>
        </form>
        {showModal && (
          <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="modal-content bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">{error ? 'Error' : 'Order Status'}</h2>
              {error ? (
                <p className="mb-4">{error}</p>
              ) : (
                <div className="mb-4">
                  <p>
                    <strong>Status:</strong> {orderDetails?.status || 'Unknown'}
                  </p>
                  {orderDetails?.items && (
                    <div className="mt-2">
                      <strong>Items:</strong>
                      <ul className="list-disc pl-5">
                        {orderDetails.items.map((item, index) => (
                          <li key={index}>
                            {item.name} (x{item.quantity})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {orderDetails?.shipment && (
                    <div className="mt-2">
                      <strong>Shipping:</strong>
                      <p>Carrier: {orderDetails.shipment.carrier}</p>
                      <p>Tracking Number: {orderDetails.shipment.tracking_number}</p>
                      <p>
                        <a
                          href={orderDetails.shipment.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Track Shipment
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="btn ghost mt-2 text-gray-600 border border-gray-300 py-2 px-4 rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        )}
        <p className="mt-6 text-center">
          <Link href="/designs" className="text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </p>
      </section>
    </>
  );
}