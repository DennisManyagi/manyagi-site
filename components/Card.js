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
      className={`card bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl ${className}`}
      role="article"
      onClick={handleClick}
    >
      {image && <img src={image} alt={title || 'Card Image'} className="w-full h-[300px] object-cover" loading="lazy" />}
      <div className="p-6 text-center"> {/* Added text-center for global centering */}
        {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>} {/* Consistent mb-4 for equal spacing */}
        {description && <p className="text-gray-700 text-base mb-4">{description}</p>} {/* mb-4 instead of mb-6 for equality */}
        {link && (
          <a
            href={link}
            className={`btn bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition block mx-auto w-fit mb-4 ${className.includes('capital') ? 'hover:bg-purple-500' : ''}`} {/* Added block mx-auto w-fit mb-4 for centering and spacing */}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn More
          </a>
        )}
        <div className="flex flex-wrap justify-center gap-4 items-center"> {/* Changed to flex-wrap justify-center gap-4 for responsive inline/stacking, centered group */}
          {children}
        </div>
      </div>
    </motion.article>
  );
};

export default Card;