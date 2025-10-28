import { AnimatePresence, motion } from 'framer-motion';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FuturisticCard } from '@/components/ui/FuturisticCard';
import { CurrencyIcon } from '@/lib/currency-icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { CheckCircle, Lock, Send } from 'lucide-react';
import { useRates } from '@/contexts/RateContext';
import AnimatedNumericText from '@/components/ui/AnimatedNumericText';
import { useMemo } from 'react';

const cardVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -20 },
};

const Step1Visual = () => {
    const { getConversionRate } = useRates();
    const rate = useMemo(() => getConversionRate('USD', 'BTC'), [getConversionRate]);
    const receivedAmount = 1000 * rate;

    return (
        <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: 'easeOut' }} className="space-y-4">
            <div className="flex justify-between items-center text-sm p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">You send</span>
                <div className="flex items-center gap-2 font-semibold">
                    <span>1,000</span>
                    <CurrencyIcon symbol="USD" className="h-5 w-5" />
                    <span>USD</span>
                </div>
            </div>
            <div className="flex justify-between items-center text-sm p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">You get approx.</span>
                <div className="flex items-center gap-2 font-semibold text-primary">
                    <AnimatedNumericText value={receivedAmount} precision={6} />
                    <CurrencyIcon symbol="BTC" className="h-5 w-5" />
                    <span>BTC</span>
                </div>
            </div>
            <Button className="w-full button-glow" disabled>Continue</Button>
        </motion.div>
    );
};

const Step2Visual = () => {
    const { getConversionRate } = useRates();
    const rate = useMemo(() => getConversionRate('BTC', 'ETH'), [getConversionRate]);
    const receivedAmount = 0.1 * rate;

    return (
        <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: 'easeOut' }} className="space-y-4">
            <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">You send</span><div className="flex items-center gap-2 font-semibold"><span>0.1</span><CurrencyIcon symbol="BTC" className="h-5 w-5" /><span>BTC</span></div></div>
            <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Floating rate</span><Lock className="h-4 w-4 text-muted-foreground" /></div>
            <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">You get approx.</span><div className="flex items-center gap-2 font-semibold text-primary"><AnimatedNumericText value={receivedAmount} precision={6} /><CurrencyIcon symbol="ETH" className="h-5 w-5" /><span>ETH</span></div></div>
            <div className="space-y-2 pt-2">
                <Label htmlFor="wallet-address-demo">Enter the wallet address</Label>
                <Input id="wallet-address-demo" defaultValue="0x...your...eth...address" readOnly className="font-mono text-xs focus:ring-primary/50 focus:border-primary/50" />
            </div>
            <Button className="w-full button-glow" disabled>Create an exchange</Button>
        </motion.div>
    );
};

const Step3Visual = () => (
    <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: 'easeOut' }} className="flex flex-col items-center space-y-4">
        <div className="p-2 bg-white rounded-lg box-glow">
            <QRCode value="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" size={128} bgColor="transparent" fgColor="#000" />
        </div>
        <div className="w-full space-y-2">
            <Label>BTC Address</Label>
            <Input defaultValue="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" readOnly className="font-mono text-xs" />
        </div>
    </motion.div>
);

const Step4Visual = () => (
    <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: 'easeOut' }} className="flex flex-col items-center space-y-4 text-center">
        <motion.div 
            className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
        >
            <CheckCircle className="w-10 h-10" />
        </motion.div>
        <p className="text-muted-foreground">Your crypto is on its way! We'll notify you once the transaction is complete.</p>
        <Button variant="outline" disabled>View on Explorer</Button>
    </motion.div>
);

const stepVisuals = [
    { title: "Start Your Exchange", description: "Select your currency pair", visual: <Step1Visual /> },
    { title: "Provide Details", description: "Enter recipient's wallet address", visual: <Step2Visual /> },
    { title: "Make Your Payment", description: "Send funds to the provided address", visual: <Step3Visual /> },
    { title: "Exchange Complete", description: "Your crypto is on its way", visual: <Step4Visual /> },
];

export default function ExchangeDemoCard({ step }: { step: number }) {
    const currentVisual = stepVisuals[step];

    return (
        <FuturisticCard className="sticky top-24">
            <CardHeader>
                <CardTitle className="text-lg text-glow">{currentVisual.title}</CardTitle>
                <CardDescription>{currentVisual.description}</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[280px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {currentVisual.visual}
                </AnimatePresence>
            </CardContent>
        </FuturisticCard>
    );
}
