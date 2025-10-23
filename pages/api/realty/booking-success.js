// pages/realty/booking-success.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function BookingSuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      fetch(`/api/realty/booking-summary?session_id=${session_id}`)
        .then(res => res.json())
        .then(data => {
          setSummary(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session_id]);

  if (loading) return <div>Loading booking summary...</div>;

  return (
    <>
      <Head>
        <title>Booking Success — Manyagi Realty</title>
      </Head>
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Booking Confirmed!</h1>
        {summary ? (
          <div>
            <p>Property: {summary.property}</p>
            <p>Check-in: {summary.checkin}</p>
            <p>Check-out: {summary.checkout}</p>
            <p>Guests: {summary.guests}</p>
            <p>Status: {summary.status}</p>
          </div>
        ) : (
          <p>Thank you for your booking. Check your email for details.</p>
        )}
      </section>
    </>
  );
}