import { motion, useRef, useEffect } from 'framer-motion';
import { Parallax } from 'react-scroll-parallax';
import { gsap } from 'gsap';

const Card = ({ children, className = '' }) => {
  const ref = useRef(null);

  useEffect(() => {
    gsap.to(ref.current, { scale: 1.05, duration: 0.3, paused: true }); // Hover scale
    ref.current.addEventListener('mouseenter', () => gsap.to(ref.current, { scale: 1.05, duration: 0.3 }));
    ref.current.addEventListener('mouseleave', () => gsap.to(ref.current, { scale: 1, duration: 0.3 }));
  }, []);

  return (
    <Parallax y={[-5, 5]}>
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-lg transition-shadow ${className}`}
        role="article"
      >
        {children}
      </motion.article>
    </Parallax>
  );
};

export default Card;