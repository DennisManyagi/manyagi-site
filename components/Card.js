// components/Card.js
import { motion } from 'framer-motion';

const Card = ({ children, className = '', title, description, image, link, category }) => {
  const handleClick = () => {
    if (category) {
      const clicks = JSON.parse(localStorage.getItem('clicks') || '{}');
      clicks[category] = (clicks[category] || 0) + 1;
      localStorage.setItem('clicks', JSON.stringify(clicks));
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`card bg-gray-100 rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl ${className}`}
      role="article"
      onClick={handleClick}
    >
      {image && <img src={image} alt={title || 'Card Image'} className="w-full h-[300px] object-cover" loading="lazy" />}
      <div className="p-6">
        {title && <h3 className="text-2xl font-bold mb-2">{title}</h3>}
        {description && <p className="text-gray-700 text-base mb-4">{description}</p>}
        {link && (
          <a
            href={link}
            className={`btn bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition ${className.includes('capital') ? 'hover:bg-purple-500' : ''}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn More
          </a>
        )}
        <div className="flex space-x-4">{children}</div>
      </div>
    </motion.article>
  );
};

export default Card;