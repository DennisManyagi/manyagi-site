import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import { useState } from 'react';

export default function Track() {
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/track?order_id=${encodeURIComponent(orderId)}`);
      const data = await response.json();
      setOrderDetails(data);
    } catch (error) {
      console.error('Tracking error:', error);
      alert('Failed to track order');
    }
  };

  return (
    <>
      {/* …keep your existing UI … */}
    </>
  );
}
