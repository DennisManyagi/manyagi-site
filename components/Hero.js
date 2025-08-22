// components/Hero.js
import { motion } from 'framer-motion';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';

const Hero = ({ kicker, title, lead, children, carouselImages = [], videoSrc, height = 'h-[600px]' }) => {
  return (
    <motion.section
      className={`relative ${height} flex flex-col sm:flex-row items-center justify-center overflow-hidden bg-white z-0`}
      aria-labelledby="hero-title"
    >
      {videoSrc && (
        <video
          autoPlay={typeof window !== 'undefined' && window.innerWidth >= 640 ? true : false}
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={videoSrc}
          aria-hidden="true"
        />
      )}
      {carouselImages.length > 0 && (
        <Carousel
          autoPlay
          interval={5000}
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          stopOnHover
          showArrows
          className="z-0 relative w-full sm:w-1/2 h-auto sm:h-full mt-0" // Added mt-0 for mobile top alignment
        >
          {carouselImages.map((img, i) => (
            <div key={i} className="w-full h-full"> {/* Wrapper div to ensure full height */}
              <img src={img} alt={`Slide ${i + 1}`} className="object-cover w-full h-full" loading="lazy" />
            </div>
          ))}
        </Carousel>
      )}
      <div className="relative z-30 p-10 text-black max-w-4xl mx-auto flex flex-col items-center text-center py-4">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="uppercase tracking-widest text-lg mb-4"
        >
          {kicker}
        </motion.span>
        <motion.h1
          id="hero-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-bold mb-4 leading-tight"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-base mb-8 max-w-2xl"
        >
          {lead}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col md:flex-row gap-4"
        >
          {children}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;