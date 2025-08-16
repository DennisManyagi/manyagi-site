import { motion } from 'framer-motion';

const Card = ({ children }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="card"
      role="article"
    >
      {children}
    </motion.article>
  );
};

export default Card;