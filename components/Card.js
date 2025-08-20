// components/Card.js
import { motion } from 'framer-motion';
import { Parallax } from 'react-scroll-parallax';
import { gsap } from 'gsap';
import { useRef, useEffect } from 'react';

const Card = ({ children, className = '', title, description, image, link, category }) => {
  const ref = useRef(null);
  const handleClick = () => {
    if (category) {
      const clicks = JSON.parse(localStorage.getItem('clicks') || '{}');
      clicks[category] = (clicks[category] || 0) + 1;
      localStorage.setItem('clicks', JSON.stringify(clicks));
    }
  };

  useEffect(() => {
    if (ref.current) {
      gsap.to(ref.current, { scale: 1.05, duration: 0.3, paused: true });
      ref.current.addEventListener('mouseenter', () => gsap.to(ref.current, { scale: 1.05, duration: 0.3 }));
      ref.current.addEventListener('mouseleave', () => gsap.to(ref.current, { scale: 1, duration: 0.3 }));
    }
  }, []);

  return (
    <Parallax y={[-5, 5]}>
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`card bg-gray-100 rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl glass ${className}`}
        role="article"
        onClick={handleClick}
      >
        {image && <img src={image} alt={title || 'Card Image'} className="w-full h-48 object-cover" loading="lazy" />}
        <div className="p-6">
          {title && <h3 className="text-2xl font-bold mb-2">{title}</h3>}
          {description && <p className="text-gray-700 mb-4">{description}</p>}
          {link && <a href={link} className="btn bg-purple-600 text-white hover:bg-purple-500" target="_blank" rel="noopener noreferrer">Learn More</a>}
          <div className="flex space-x-4">{children}</div>
        </div>
      </motion.article>
    </Parallax>
  );
};

export default Card;