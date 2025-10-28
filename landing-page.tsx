import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';
import HowItWorks from '@/components/sections/HowItWorks';
import Faq from '@/components/sections/Faq';
import Footer from './layout/Footer';
import Testimonials from './sections/Testimonials';
import ExchangeCalculator from '@/components/ExchangeCalculator';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { motion } from 'framer-motion';
import OceanWave from './ui/OceanWave';

export default function LandingPage() {
  const config = useAppConfig();

  return (
    <>
      <Header />
      <main>
        <div className="relative overflow-hidden pb-32 md:pb-48">
          <div className="container">
            <Hero />
          </div>
          <OceanWave />
        </div>
        
        <div className="container relative z-10">
            <motion.section
              id="exchange-calculator"
              className="pb-12 sm:pb-24"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="mx-auto max-w-xl text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display">
                        {config?.calculator_title || 'Instant Exchange'}
                    </h2>
                    <p className="mt-4 text-lg text-foreground/80">
                        {config?.calculator_subtitle || 'Simple, fast, and secure. No registration needed.'}
                    </p>
                </div>
                <ExchangeCalculator />
            </motion.section>

            <HowItWorks />
            <Testimonials />
            <Faq />
        </div>
      </main>
      <Footer />
    </>
  );
}
