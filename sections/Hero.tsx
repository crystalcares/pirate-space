import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PirateShip from '../ui/PirateShip';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { HashLink } from 'react-router-hash-link';
import StarfieldBackground from '../ui/StarfieldBackground';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Hero() {
  const config = useAppConfig();

  const heroTitle = config?.hero_title || "The Pirate Way to Exchange";
  const titleParts = heroTitle.split(' ');
  const lastWord = titleParts.pop() || "Exchange";
  const mainTitle = titleParts.join(' ');

  return (
    <section className="relative w-full py-24 md:py-32 text-left overflow-hidden">
      <StarfieldBackground />
      <div className="container relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-xl"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tighter"
          >
            {mainTitle} <br />
            <span className="relative inline-block text-glow">
                {lastWord}
                <motion.svg
                    className="absolute -bottom-1 left-0 w-full h-auto"
                    viewBox="0 0 200 20"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.5, delay: 1, ease: 'easeInOut' }}
                >
                    <path d="M 5 10 C 50 2, 150 18, 195 10" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" />
                </motion.svg>
            </span>
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="mt-6 max-w-lg text-lg text-muted-foreground"
          >
            {config?.hero_subtitle || 'For traders who love technical analysis, robust charting tools are essential. Trading View is one option.'}
          </motion.p>
          <motion.div 
            variants={itemVariants}
            className="mt-10 flex items-center justify-start gap-4"
          >
              <Button size="lg" asChild className="button-glow-hover">
                  <HashLink smooth to="/#exchange-calculator">
                    {config?.hero_cta1_text || 'Get Started'}
                  </HashLink>
              </Button>
          </motion.div>
        </motion.div>
      </div>
      <PirateShip imageUrl={config?.ship_image_url} />
    </section>
  );
}
