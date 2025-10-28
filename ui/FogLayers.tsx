import { motion } from 'framer-motion';

const fogVariants = {
  initial: (custom: number) => ({
    x: custom % 2 === 0 ? '-100%' : '100%',
    opacity: 0,
  }),
  animate: (custom: number) => ({
    x: custom % 2 === 0 ? '100%' : '-100%',
    opacity: [0, 0.2, 0.2, 0],
    transition: {
      duration: 40 + custom * 10,
      repeat: Infinity,
      ease: 'linear',
      delay: custom * 5,
    },
  }),
};

const FogLayers = () => {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={fogVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
          style={{ top: `${i * 25}%`, height: '50%' }}
        />
      ))}
    </>
  );
};

export default FogLayers;
