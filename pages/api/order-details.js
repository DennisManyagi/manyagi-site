// pages/api/order-details.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const orderDoc = await getDoc(doc(db, 'orders', session_id));
    if (!orderDoc.exists()) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(orderDoc.data());
  } catch (error) {
    console.error('Firestore error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
}