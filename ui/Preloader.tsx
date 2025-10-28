import { motion } from 'framer-motion';
import { PirateLogo } from './logo-icon';

const preloaderVariants = {
  initial: { opacity: 1 },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.8, ease: [0.83, 0, 0.17, 1] }
  },
};

export default function Preloader() {
  return (
    <motion.div 
      variants={preloaderVariants}
      initial="initial"
      exit="exit"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        >
          <PirateLogo className="w-24 h-24 text-primary" />
        </motion.div>
        <motion.h1 
          className="text-3xl font-bold font-display text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
        >
          Pirate
        </motion.h1>
        <div className="w-64 h-1 bg-border/20 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.6 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
