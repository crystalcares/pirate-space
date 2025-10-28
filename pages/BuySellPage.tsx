import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import HowToSwapStepper from '@/components/exchange-portal/HowToSwapStepper';
import AntiPhishingCheck from '@/components/exchange-portal/AntiPhishingCheck';
import ExchangeFaq from '@/components/exchange-portal/ExchangeFaq';
import BuySellPortalForm from '@/components/exchange-portal/BuySellPortalForm';

export default function BuySellPage() {
    const [currentStep, setCurrentStep] = useState(1);

    return (
        <div className="bg-muted/20 text-foreground">
            <Header />
            <main className="container py-12 sm:py-16 relative z-10">
                <div className="grid lg:grid-cols-[320px_1fr] xl:grid-cols-[350px_1fr] gap-12 xl:gap-16 items-start">
                    {/* Left Sidebar */}
                    <aside className="hidden lg:flex flex-col gap-8 sticky top-28">
                        <HowToSwapStepper currentStep={currentStep} />
                        <AntiPhishingCheck />
                    </aside>

                    {/* Main Content */}
                    <div className="w-full max-w-lg mx-auto lg:mx-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-3xl font-bold tracking-tight mb-6">
                                Buy or Sell Crypto
                            </h1>
                            <BuySellPortalForm setCurrentStep={setCurrentStep} />
                        </motion.div>
                        
                        <div className="mt-16">
                            <ExchangeFaq />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
