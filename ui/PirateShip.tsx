import { motion } from 'framer-motion';

interface PirateShipProps {
  imageUrl?: string;
}

const DefaultShip = () => (
    <g transform="translate(50, 100) scale(1.2) rotate(10)" stroke="hsl(var(--primary))" strokeWidth="2" fill="none">
        <path d="M 50 300 C 100 320, 250 320, 300 300 L 280 280 L 70 280 Z" />
        <path d="M 70 280 L 280 280 L 270 260 L 80 260 Z" fill="hsl(var(--primary) / 0.1)" />
        <line x1="175" y1="280" x2="175" y2="100" />
        <path d="M 180 120 C 250 150, 250 220, 180 250 Z" fill="hsl(var(--primary) / 0.2)" />
        <path d="M 170 150 C 100 170, 100 220, 170 240 Z" fill="hsl(var(--primary) / 0.1)" />
    </g>
);

const PirateShip = ({ imageUrl }: PirateShipProps) => {
  return (
    <motion.div
      className="absolute bottom-[-5%] right-[-10%] w-[500px] h-[500px] md:bottom-[-10%] md:right-[-5%] md:w-[650px] md:h-[650px] lg:w-[700px] lg:h-[700px] opacity-20 dark:opacity-30 pointer-events-none"
      initial={{ x: '50%', opacity: 0 }}
      animate={{ x: 0, opacity: [0, 0.1, 1] }}
      transition={{ duration: 2.5, ease: 'easeOut', delay: 0.8 }}
    >
      <motion.div
        className="w-full h-full relative"
        animate={{
          rotate: [1, -1, 1],
          y: [0, 8, 0],
          x: [0, -10, 0],
        }}
        transition={{
          rotate: { duration: 15, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
          y: { duration: 7, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
          x: { duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
        }}
      >
        {imageUrl ? (
            <img src={imageUrl} alt="Hero Ship" className="w-full h-full object-contain filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]" />
        ) : (
            <svg viewBox="0 0 500 500" className="w-full h-full">
                <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                </defs>
                <g filter="url(#glow)"><DefaultShip /></g>
            </svg>
        )}
        {/* Reflection */}
        <div className="absolute bottom-[-25%] left-0 w-full h-1/2 opacity-50" style={{ transform: 'scaleY(-1)' }}>
             {imageUrl ? (
                <img src={imageUrl} alt="" className="w-full h-full object-contain" style={{ maskImage: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
            ) : (
                <svg viewBox="0 0 500 500" className="w-full h-full" style={{ maskImage: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }}>
                    <DefaultShip />
                </svg>
            )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PirateShip;
