// components/Hero.js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import { tsParticles } from 'tsparticles';

const Hero = ({ kicker, title, lead, children, carouselImages = [] }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // GSAP: Register plugin and animate (synchronous)
      gsap.registerPlugin(ScrollTrigger);

      // Null-check for the target element
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        gsap.fromTo(
          heroContent,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
          }
        );
      } else {
        console.warn('Hero content element not found for GSAP animation.');
      }
      tsParticles.load('particles-js', {
        particles: {
          number: { value: 50 },
          color: { value: '#FFD700' },
          shape: { type: 'circle' },
          opacity: { value: 0.5 },
          size: { value: 3 },
          line_linked: { enable: false },
          move: { speed: 1 },
        },
        interactivity: { detect_on: 'canvas', events: { onhover: { enable: true, mode: 'bubble' } } },
        retina_detect: true,
      });
    }
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden hero-section gradient-bg"
      aria-labelledby="hero-title"
    >
      <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover z-0" src="/videos/hero-bg.mp4" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 to-yellow-500/70 z-10 blur-bg" />
      <div id="particles-js" className="absolute inset-0 z-0 opacity-30" />
      {carouselImages.length > 0 && (
        <Carousel autoPlay interval={5000} showThumbs={false} showStatus={false} infiniteLoop stopOnHover showArrows className="z-5">
          {carouselImages.map((img, i) => (
            <img key={i} src={img} alt={`Slide ${i+1}`} className="object-cover h-[70vh] md:h-[60vh]" loading="lazy" />
          ))}
        </Carousel>
      )}
      <div className="relative z-20 p-8 md:p-12 text-white max-w-4xl mx-auto flex flex-col items-center text-center hero-content">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="uppercase tracking-widest text-lg mb-4 kinetic">
          {kicker}
        </motion.span>
        <motion.h1 id="hero-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-4xl md:text-6xl font-bold mb-4 leading-tight kinetic">
          {title}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-lg md:text-2xl mb-8 max-w-2xl">
          {lead}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-col md:flex-row gap-4">
          {children}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;