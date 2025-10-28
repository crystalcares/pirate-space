import { motion } from 'framer-motion';
import FloatingCryptoIcons from './FloatingCryptoIcons';

const Wave = ({ d, ...rest }: { d: string, [key: string]: any }) => (
  <motion.path d={d} {...rest} />
);

export default function OceanWave() {
  const wavePath = "M0 50 C 250 100 250 0 500 50 S 750 100 1000 50 V 100 H 0 Z";

  return (
    <div className="absolute bottom-0 left-0 w-full h-48 md:h-64 pointer-events-none z-0">
      <FloatingCryptoIcons />
      <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <defs>
            <linearGradient id="cryptoWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0" />
            </linearGradient>
        </defs>
        
        {/* Wave Layer 1 (background) */}
        <g>
          <Wave
            d={wavePath}
            fill="url(#cryptoWaveGradient)"
            opacity={0.6}
            animate={{ x: ['-100%', '0%'] }}
            transition={{ duration: 25, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
          />
          <Wave
            d={wavePath}
            fill="url(#cryptoWaveGradient)"
            opacity={0.6}
            animate={{ x: ['0%', '100%'] }}
            transition={{ duration: 25, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
          />
        </g>
        {/* Wave Layer 2 (midground) */}
        <g>
          <Wave
            d={wavePath}
            fill="url(#cryptoWaveGradient)"
            opacity={0.4}
            transform="translate(0, 5)"
            animate={{ x: ['0%', '-100%'] }}
            transition={{ duration: 35, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
          />
          <Wave
            d={wavePath}
            fill="url(#cryptoWaveGradient)"
            opacity={0.4}
            transform="translate(0, 5)"
            animate={{ x: ['100%', '0%'] }}
            transition={{ duration: 35, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
          />
        </g>
        {/* Wave Layer 3 (foreground) */}
        <g>
          <Wave
            d={wavePath}
            fill="url(#cryptoWaveGradient)"
            opacity={0.3}
            transform="translate(0, 10)"
            animate={{ x: ['-100%', '0%'] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
          />
          <Wave
            d={wavePath}
            fill="url(#cryptoWaveGradient)"
            opacity={0.3}
            transform="translate(0, 10)"
            animate={{ x: ['0%', '100%'] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
          />
        </g>
      </svg>
    </div>
  );
}
