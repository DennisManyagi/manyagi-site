import { motion } from 'framer-motion';

const Hero = ({ kicker, title, lead, children }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="hero my-10"
      aria-labelledby="hero-title"
    >
      <span className="kicker uppercase tracking-wide text-muted text-sm">{kicker}</span>
      <h1 id="hero-title" className="text-4xl md:text-6xl font-bold my-2">{title}</h1>
      <p className="lead text-lg text-muted">{lead}</p>
      <div className="flex gap-4 mt-4">{children}</div>
    </motion.section>
  );
};

export default Hero;