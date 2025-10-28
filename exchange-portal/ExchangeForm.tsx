import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Repeat, Lock, Gift, Info, ChevronRight, ScanLine } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { TablesInsert } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useCurrencies } from '@/contexts/CurrencyContext';
import { useRates } from '@/contexts/RateContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyIcon } from '@/lib/currency-icons';
import AnimatedNumericText from '../ui/AnimatedNumericText';
import { Label } from '../ui/label';
import { useExchangeConfig } from '@/hooks/useExchangeConfig';
import { sendExchangeCreationWebhook } from '@/lib/discord';

const CurrencySelectItem = ({ currency }: { currency: string }) => (
    <div className="flex items-center gap-2">
        <CurrencyIcon symbol={currency} className="h-5 w-5" />
        <span className="font-medium">{currency.toUpperCase()}</span>
    </div>
);

const SignUpPromo = () => {
    const { setIsOpen, setInitialTab } = useAuthModal();
    const handleSignUp = () => {
        setInitialTab('signup');
        setIsOpen(true);
    };
    return (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-4 my-4">
            <div className="text-blue-400"><Gift className="h-6 w-6" /></div>
            <div className="flex-grow">
                <p className="text-sm font-semibold text-foreground">Sign up to get more cashback</p>
                <p className="text-xs text-muted-foreground">and earn up to 45.1 USDT in cashback</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignUp} className="text-blue-400 hover:text-blue-300">
                Sign Up <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    );
};

export default function ExchangeForm({ setCurrentStep }: { setCurrentStep: (step: number) => void }) {
    const { currencies } = useCurrencies();
    const { getConversionRate, loading: ratesInitialLoading } = useRates();
    const { exchangePairs } = useExchangeConfig();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialAmount = searchParams.get('amount');
    const [sendAmount, setSendAmount] = useState<number | ''>(initialAmount ? parseFloat(initialAmount) : 0.1);
    const [recipientAddress, setRecipientAddress] = useState('');

    const fromCurrency = searchParams.get('from') || '';
    const toCurrency = searchParams.get('to') || '';

    const cryptoCurrencies = useMemo(() => currencies.filter(c => c.type === 'crypto').map(c => c.symbol), [currencies]);
    const cryptoPairs = useMemo(() => exchangePairs.filter(p => cryptoCurrencies.includes(p.from) && cryptoCurrencies.includes(p.to)), [exchangePairs, cryptoCurrencies]);
    
    const uniqueFromCurrencies = useMemo(() => Array.from(new Set(cryptoPairs.map(p => p.from))), [cryptoPairs]);
    const availableToCurrencies = useMemo(() => cryptoPairs.filter(p => p.from === fromCurrency).map(p => p.to), [fromCurrency, cryptoPairs]);

    useEffect(() => {
        if (cryptoPairs.length === 0) return;
        const currentFrom = searchParams.get('from');
        const currentTo = searchParams.get('to');
        if (!currentFrom || !currentTo || !uniqueFromCurrencies.includes(currentFrom) || !availableToCurrencies.includes(currentTo)) {
            const firstPair = cryptoPairs[0];
            if (firstPair) {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('from', firstPair.from);
                newParams.set('to', firstPair.to);
                setSearchParams(newParams, { replace: true });
            }
        }
    }, [cryptoPairs, searchParams, setSearchParams, uniqueFromCurrencies, availableToCurrencies]);

    useEffect(() => {
        if (recipientAddress.trim() !== '') {
            setCurrentStep(3);
        } else if (fromCurrency && toCurrency) {
            setCurrentStep(2);
        } else {
            setCurrentStep(1);
        }
    }, [recipientAddress, fromCurrency, toCurrency, setCurrentStep]);

    const handleFromCurrencyChange = (newFrom: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('from', newFrom);
        const newToOptions = cryptoPairs.filter(p => p.from === newFrom).map(p => p.to);
        if (!newToOptions.includes(toCurrency)) {
            newParams.set('to', newToOptions[0] || '');
        }
        setSearchParams(newParams);
    };
    
    const handleToCurrencyChange = (newTo: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('to', newTo);
        setSearchParams(newParams);
    };

    const { finalAmount, fiatValue, pair } = useMemo(() => {
        if (sendAmount === '' || sendAmount <= 0) return { finalAmount: 0, fiatValue: 0, pair: null };
        
        const foundPair = cryptoPairs.find(p => p.from === fromCurrency && p.to === toCurrency);
        if (!foundPair) return { finalAmount: 0, fiatValue: 0, pair: null };

        const liveRate = getConversionRate(fromCurrency, toCurrency);
        const fiatRate = getConversionRate(fromCurrency, 'USD');

        const feePercentage = foundPair.fee_type === 'percentage' ? foundPair.fee : 0;
        const finalRate = liveRate * (1 - (feePercentage / 100));

        const calculatedFinalAmount = sendAmount * finalRate;
        const calculatedFiatValue = sendAmount * fiatRate;
        
        return { finalAmount: calculatedFinalAmount, fiatValue: calculatedFiatValue, pair: foundPair };
    }, [sendAmount, fromCurrency, toCurrency, getConversionRate, cryptoPairs]);

    const handleCreateExchange = async () => {
        if (!pair || sendAmount === '' || sendAmount <= 0) {
            toast.error("Please enter a valid amount and select a valid pair.");
            return;
        }
        if (!recipientAddress.trim()) {
            toast.error("Please enter the recipient's wallet address.");
            return;
        }
        
        setIsSubmitting(true);
        const exchangeData: TablesInsert<'exchanges'> = {
            user_id: user?.id || null,
            from_currency: fromCurrency,
            to_currency: toCurrency,
            send_amount: sendAmount,
            receive_amount: finalAmount,
            fee_amount: pair.fee,
            fee_details: `Live Rate. Fee: ${pair.fee}%`,
            status: 'pending',
            recipient_wallet_address: recipientAddress,
            payment_method_id: pair.payment_method_id,
            usd_value: fiatValue,
        };

        const { data, error } = await supabase.from('exchanges').insert(exchangeData).select('id, exchange_id').single();
        setIsSubmitting(false);

        if (error) {
            toast.error(`Failed to create exchange: ${error.message}`);
        } else if (data) {
            toast.success("Exchange created! Redirecting to finalize...");
            
            sendExchangeCreationWebhook({
                exchangeId: data.exchange_id,
                userId: user?.id || null,
                userEmail: user?.email || 'Anonymous',
                exchangeType: 'Crypto-to-Crypto',
                fromAmount: sendAmount,
                fromCurrency: fromCurrency,
                toAmount: finalAmount,
                toCurrency: toCurrency,
                fiatValue: fiatValue,
                recipientAddress: recipientAddress,
            });

            navigate(`/track/${data.id}`);
        }
    };

    return (
        <Card className="shadow-2xl bg-card/90 backdrop-blur-sm border-border/20">
            <CardContent className="p-6 space-y-4">
                {/* You Send */}
                <div>
                    <Label className="text-sm text-muted-foreground">You send</Label>
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-2 mt-1">
                        <Input 
                            type="number" 
                            value={sendAmount} 
                            onChange={(e) => setSendAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="bg-transparent text-xl font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                        />
                        <Select value={fromCurrency} onValueChange={handleFromCurrencyChange}>
                            <SelectTrigger className="w-[120px] h-10 bg-background border-input font-semibold rounded-md shadow-sm">
                                <SelectValue><CurrencySelectItem currency={fromCurrency} /></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueFromCurrencies.map(c => <SelectItem key={c} value={c}><CurrencySelectItem currency={c} /></SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">≈ $<AnimatedNumericText value={fiatValue} precision={2} /></p>
                </div>

                {/* Rate info */}
                <div className="flex justify-between items-center text-sm text-muted-foreground px-1">
                    <div className="flex items-center gap-2"><Lock className="h-4 w-4" /> Floating rate</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Repeat className="h-4 w-4" /></Button>
                </div>

                {/* You Get */}
                <div>
                    <Label className="text-sm text-muted-foreground">You get</Label>
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-2 mt-1">
                        <div className="text-xl font-semibold text-primary">≈ <AnimatedNumericText value={finalAmount} precision={8} /></div>
                        <Select value={toCurrency} onValueChange={handleToCurrencyChange}>
                            <SelectTrigger className="w-[120px] h-10 bg-background border-input font-semibold rounded-md shadow-sm">
                                <SelectValue><CurrencySelectItem currency={toCurrency} /></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {availableToCurrencies.map(c => <SelectItem key={c} value={c}><CurrencySelectItem currency={c} /></SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {!user && <SignUpPromo />}

                <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="recipient-address" className="font-semibold">Enter the wallet address</Label>
                        <a href="#" className="text-xs text-primary hover:underline flex items-center gap-1">Don't have a wallet? <Info className="h-3 w-3"/></a>
                    </div>
                    <div className="relative">
                        <Input 
                            id="recipient-address"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            placeholder={`The recipient's ${toCurrency} address`}
                            className="pr-10 h-11"
                        />
                        <ScanLine className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                </div>

                <Button onClick={handleCreateExchange} size="lg" className="w-full h-12 text-base" disabled={isSubmitting || ratesInitialLoading}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create an exchange'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                    By clicking Create an exchange, you agree to the <Link to="/privacy" className="underline">Privacy Policy</Link> and <Link to="/terms" className="underline">Terms of Service</Link>.
                </p>
            </CardContent>
        </Card>
    );
}
