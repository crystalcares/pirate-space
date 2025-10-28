import { motion } from 'framer-motion';
import { useCurrencies } from '@/contexts/CurrencyContext';
import { useMemo } from 'react';

const manualIcons = [
    { symbol: 'PAYPAL', icon_url: 'https://img.icons8.com/color/96/paypal.png' },
];

const FloatingCryptoIcons = () => {
  const { currencies, loading } = useCurrencies();

  const icons = useMemo(() => {
    if (loading) return [];
    
    const requestedSymbols = ['BTC', 'ETH', 'SOL', 'LTC', 'USDT', 'INR', 'USD'];
    const dbIcons = currencies
      .filter(c => c.icon_url && requestedSymbols.includes(c.symbol.toUpperCase()))
      .map(c => ({ symbol: c.symbol, icon_url: c.icon_url! }));
      
    const allIcons = [...dbIcons, ...manualIcons];

    return allIcons.map((icon, index) => ({
      id: icon.symbol || index,
      src: icon.icon_url,
      alt: icon.symbol,
      size: Math.random() * 20 + 20,
      opacity: Math.random() * 0.4 + 0.2,
    }));
  }, [currencies, loading]);

  if (loading) return null;

  return (
    <>
      {icons.map(icon => {
        const yBase = Math.random() * 30 + 50; // Position on the water (50% to 80% from top)
        const yBob = Math.random() * 4 + 2;
        const xStart = Math.random() * 90 + 5;
        const xEnd = xStart + (Math.random() - 0.5) * 30; // Reduced horizontal drift
        
        const duration = Math.random() * 8 + 7;

        return (
          <motion.div
            key={icon.id}
            className="absolute"
            style={{
              height: icon.size,
              width: icon.size,
              opacity: icon.opacity,
            }}
            initial={{
              x: `${xStart}vw`,
              y: `${yBase}%`,
              rotate: Math.random() * 360,
            }}
            animate={{
              x: [`${xStart}vw`, `${xEnd}vw`],
              y: [`${yBase - yBob}%`, `${yBase + yBob}%`],
              rotate: [0, Math.random() > 0.5 ? 360 : -360],
              skewX: [-3, 3, -3],
            }}
            transition={{
              x: { duration: duration * 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
              y: { duration: duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
              rotate: { duration: duration * 5, repeat: Infinity, repeatType: 'loop', ease: 'linear' },
              skewX: { duration: duration * 1.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
            }}
          >
            <img src={icon.src} alt={icon.alt} className="w-full h-full" />
            {/* Reflection */}
            <img 
              src={icon.src} 
              alt="" 
              className="absolute top-full left-0 w-full h-full"
              style={{
                transform: 'scaleY(-1)',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)',
                opacity: 0.8
              }}
            />
          </motion.div>
        );
      })}
    </>
  );
};

export default FloatingCryptoIcons;
