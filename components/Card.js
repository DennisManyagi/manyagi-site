// components/Card.js
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../lib/cartSlice';

const Card = ({
  children,
  className = '',
  title,
  description,
  image,
  link,
  category,
  buyButton = null,   // product object
  onBuy,              // optional handler from parent
  tags = [],          // optional explicit tags (fallback if product.tags missing)
  showTags = true,
  showNftBadge = true,
}) => {
  const dispatch = useDispatch();

  const product = buyButton || {};
  const resolvedTags =
    Array.isArray(product.tags) && product.tags.length ? product.tags : tags;
  const nftUrl = product.nft_url || product?.metadata?.nft_url || null;
  const hasNFT = Boolean(nftUrl);

  const handleClick = () => {
    if (category && typeof window !== 'undefined') {
      try {
        const clicks = JSON.parse(localStorage.getItem('clicks') || '{}');
        clicks[category] = (clicks[category] || 0) + 1;
        localStorage.setItem('clicks', JSON.stringify(clicks));
      } catch {
        /* ignore */
      }
    }
  };

  const handleBuy = (p) => {
    dispatch(addToCart(p));
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`card bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl dark:bg-gray-900 ${className}`}
      role="article"
      onClick={handleClick}
    >
      {/* Media */}
      <div className="relative">
        {image && (
          <img
            src={image}
            alt={title || 'Card Image'}
            className="w-full h-[300px] object-cover"
            loading="lazy"
          />
        )}

        {/* NFT Ribbon */}
        {showNftBadge && hasNFT && (
          <div
            className="absolute top-3 right-3 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded"
            title="This design has a linked NFT"
          >
            NFT
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 text-center">
        {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>}
        {description && (
          <p className="text-gray-700 dark:text-gray-300 text-base mb-4">
            {description}
          </p>
        )}

        {/* Tags */}
        {showTags && Array.isArray(resolvedTags) && resolvedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {resolvedTags.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Learn more (optional) */}
        {link && (
          <a
            href={link}
            className={`btn bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition block mx-auto w-fit mb-4 ${
              className && className.includes('capital') ? 'hover:bg-purple-500' : ''
            }`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn More
          </a>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          {buyButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onBuy === 'function') {
                  onBuy(buyButton);
                } else {
                  handleBuy(buyButton);
                }
              }}
              className="btn bg-yellow-500 text-black py-2 px-4 rounded hover:bg-yellow-400 transition"
            >
              Buy Now
              {typeof buyButton.price !== 'undefined'
                ? ` - $${Number(buyButton.price).toFixed(2)}`
                : ''}
            </button>
          )}

          {/* View NFT */}
          {hasNFT && (
            <a
              href={nftUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn bg-gray-900 text-white py-2 px-4 rounded hover:bg-black transition"
              title="View NFT"
            >
              View NFT
            </a>
          )}
        </div>

        {/* Extra children */}
        <div className="flex flex-wrap justify-center gap-4 items-center mt-4">
          {children}
        </div>
      </div>
    </motion.article>
  );
};

export default Card;
