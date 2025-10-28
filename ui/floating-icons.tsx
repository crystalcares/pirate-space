import { motion } from 'framer-motion';
import { iconUrlMap } from '@/lib/currency-icons';

const icons = Object.keys(iconUrlMap)
  .filter(key => !['paypal', 'upi', 'inr', 'dollar', 'euro'].includes(key))
  .map((key, index) => ({
    id: index,
    src: iconUrlMap[key],
    alt: key,
    style: {
      height: Math.random() * 30 + 20,
      width: Math.random() * 30 + 20,
      position: 'absolute',
      filter: `blur(${Math.random() * 1.5}px)`,
    },
    initial: {
      x: `${Math.random() * 100}vw`,
      y: `${Math.random() * 100}vh`,
      opacity: 0,
      scale: Math.random() * 0.5 + 0.5,
    },
    animate: {
      x: `${Math.random() * 100}vw`,
      y: `${Math.random() * 100}vh`,
      opacity: [0, 0.4, 0.4, 0],
      scale: Math.random() * 0.5 + 0.5,
    },
    transition: {
      duration: Math.random() * 20 + 20,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
      delay: Math.random() * 5,
    },
  }));

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {icons.map(icon => (
        <motion.img
          key={icon.id}
          src={icon.src}
          alt={icon.alt}
          style={icon.style as any}
          initial={icon.initial}
          animate={icon.animate}
          transition={icon.transition}
        />
      ))}
    </div>
  );
};

export default FloatingIcons;
