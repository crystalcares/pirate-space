import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { CheckCircle, Coins, Send, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import ExchangeDemoCard from './how-it-works/ExchangeDemoCard';

const steps = [
    {
        icon: Coins,
        title: "Choose Your Pair",
        description: "Select the currency you want to send and the one you want to receive. Our platform supports a wide variety of crypto and fiat currencies.",
    },
    {
        icon: Wallet,
        title: "Enter Recipient's Address",
        description: "Provide the recipient's wallet address. Be extra careful and double-check it. Your crypto will be sent to this address after the exchange.",
    },
    {
        icon: Send,
        title: "Make the Payment",
        description: "We'll provide you with the payment details. Send the exact amount to the specified address to proceed with the exchange.",
    },
    {
        icon: CheckCircle,
        title: "Receive Your Crypto",
        description: "Once your payment is confirmed, we'll process the exchange and send the crypto directly to the address you provided.",
    },
];

export default function HowItWorks() {
    const [currentStep, setCurrentStep] = useState(0);
    const config = useAppConfig();

    return (
        <section id="how-it-works" className="py-12 sm:py-24 overflow-hidden">
            <div className="container">
                <motion.div 
                    className="mx-auto max-w-xl text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display text-glow">
                        {config?.how_it_works_title || 'How It Works'}
                    </h2>
                    <p className="mt-4 text-lg text-foreground/80">
                        {config?.how_it_works_subtitle || 'A simple, transparent, and secure exchange process.'}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <motion.div 
                        className="space-y-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ staggerChildren: 0.1 }}
                    >
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                                className={cn(
                                    "p-4 rounded-lg cursor-pointer transition-all duration-300 border border-transparent",
                                    currentStep === index ? 'bg-muted/80 border-primary/20' : 'hover:bg-muted/50'
                                )}
                                onClick={() => setCurrentStep(index)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                                        currentStep === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    )}>
                                        <step.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-foreground">{step.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                    
                    <div className="relative h-full">
                        <ExchangeDemoCard step={currentStep} />
                    </div>
                </div>
            </div>
        </section>
    );
}
