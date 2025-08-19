// components/Recommender.js
import { useEffect, useState } from 'react';

const Recommender = () => {
  const [recommendation, setRecommendation] = useState('');

  useEffect(() => {
    const clicks = JSON.parse(localStorage.getItem('clicks') || '{}');
    const mostClicked = Object.keys(clicks).sort((a, b) => clicks[b] - clicks[a])[0];
    setRecommendation(
      mostClicked === 'publishing' ? 'Check out our latest books!' :
      mostClicked === 'designs' ? 'Explore our creative designs!' :
      mostClicked === 'media' ? 'Watch our latest videos!' :
      mostClicked === 'capital' ? 'Get trading signals!' :
      mostClicked === 'tech' ? 'Download our apps!' :
      'Discover all Manyagi divisions!'
    );
  }, []);

  return (
    <div className="p-6 text-center glass mt-4">
      <p className="text-lg kinetic">{recommendation}</p>
    </div>
  );
};

export default Recommender;