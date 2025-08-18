import { motion } from 'framer-motion';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import { useEffect } from 'react';

const Hero = ({ kicker, title, lead, children, carouselImages = [] }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('particles.js').then(({ default: particlesJS }) => {
        particlesJS('particles-js', {
          particles: {
            number: { value: 50 },
            color: { value: '#50C878' },
            shape: { type: 'circle' },
            opacity: { value: 0.5 },
            size: { value: 3 },
            line_linked: { enable: false },
            move: { speed: 1 },
          },
          interactivity: { detect_on: 'canvas', events: { onhover: { enable: true, mode: 'bubble' } } },
          retina_detect: true,
        });
      });
    }
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative my-10 overflow-hidden rounded-xl"
      aria-labelledby="hero-title"
    >
      <div id="particles-js" className="absolute inset-0 z-0 opacity-30" />
      {carouselImages.length > 0 && (
        <Carousel autoPlay={false} interval={5000} showThumbs={false} showStatus={false} infiniteLoop stopOnHover>
          {carouselImages.map((img, i) => (
            <img key={i} src={img} alt={`Slide ${i+1}`} className="object-cover h-[60vh]" loading="lazy" />
          ))}
        </Carousel>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-gold opacity-70 z-10" />
      <div className="relative z-20 p-8 text-white max-w-4xl">
        <span className="uppercase tracking-wide text-sm text-emerald-300">{kicker}</span>
        <h1 id="hero-title" className="text-5xl font-bold my-2">{title}</h1>
        <p className="text-xl text-muted-foreground">{lead}</p>
        <div className="flex gap-4 mt-6">{children}</div>
      </div>
    </motion.section>
  );
};

export default Hero;