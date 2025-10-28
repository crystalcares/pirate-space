import { useState, useMemo, FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useExchangeConfig } from '@/hooks/useExchangeConfig';
import { CurrencyIcon } from '@/lib/currency-icons';
import AnimatedNumericText from '../ui/AnimatedNumericText';
import { useCurrencies } from '@/contexts/CurrencyContext';
import { useRates } from '@/contexts/RateContext';
import { formatDistanceToNow } from 'date-fns';

const CurrencySelectItem = ({ currency }: { currency: string }) => (
    <div className="flex items-center gap-2">
        <CurrencyIcon symbol={currency} className="h-6 w-6 rounded-full" />
        <span className="font-semibold">{currency.toUpperCase()}</span>
    </div>
);

interface InputRowProps {
    label: string;
    amount: number | '';
    onAmountChange?: (value: number | '') => void;
    currency: string;
    onCurrencyChange: (value: string) => void;
    currencyOptions: string[];
    isInput?: boolean;
    className?: string;
}

const InputRow: FC<InputRowProps> = ({ label, amount, onAmountChange, currency, onCurrencyChange, currencyOptions, isInput = false, className }) => (
    <div className={className}>
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
            {isInput ? (
                <Input 
                    type="number" 
                    placeholder="100" 
                    value={amount} 
                    onChange={(e) => onAmountChange?.(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="bg-transparent text-2xl font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                />
            ) : (
                <div className="text-2xl font-semibold">
                    <AnimatedNumericText value={typeof amount === 'number' ? amount : 0} />
                </div>
            )}
            <Select value={currency} onValueChange={onCurrencyChange}>
                <SelectTrigger className="w-[130px] h-12 bg-background border-input font-semibold rounded-lg shadow-sm">
                    <SelectValue>
                        <CurrencySelectItem currency={currency} />
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {currencyOptions.map(c => <SelectItem key={c} value={c}><CurrencySelectItem currency={c} /></SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    </div>
);

export default function BuySellPanel() {
    const { exchangePairs } = useExchangeConfig();
    const { currencies } = useCurrencies();
    const { getConversionRate, loading: ratesInitialLoading, isRefetching, lastUpdated } = useRates();
    const navigate = useNavigate();
    
    const [mode, setMode] = useState<'buy' | 'sell'>('buy');
    const [payAmount, setPayAmount] = useState<number | ''>(100);
    const [payCurrency, setPayCurrency] = useState('');
    const [getCurrency, setGetCurrency] = useState('');

    const { buyPairs, sellPairs } = useMemo(() => {
        const fiat = currencies.filter(c => c.type === 'fiat').map(c => c.symbol);
        const crypto = currencies.filter(c => c.type === 'crypto').map(c => c.symbol);
        const buy = exchangePairs.filter(p => fiat.includes(p.from) && crypto.includes(p.to));
        const sell = exchangePairs.filter(p => crypto.includes(p.from) && fiat.includes(p.to));
        return { buyPairs: buy, sellPairs: sell };
    }, [currencies, exchangePairs]);

    const activePairs = mode === 'buy' ? buyPairs : sellPairs;
    const fromOptions = useMemo(() => Array.from(new Set(activePairs.map(p => p.from))), [activePairs]);
    const toOptions = useMemo(() => Array.from(new Set(activePairs.filter(p => p.from === payCurrency).map(p => p.to))), [activePairs, payCurrency]);

    useEffect(() => {
        if (activePairs.length > 0) {
            const firstPair = activePairs[0];
            setPayCurrency(firstPair.from);
            setGetCurrency(firstPair.to);
        } else {
            setPayCurrency('');
            setGetCurrency('');
        }
        setPayAmount(mode === 'buy' ? 100 : 1);
    }, [mode, activePairs]);

    useEffect(() => {
        if (!payCurrency || activePairs.length === 0) return;
        const availableTo = activePairs.filter(p => p.from === payCurrency).map(p => p.to);
        if (!availableTo.includes(getCurrency)) {
            setGetCurrency(availableTo[0] || '');
        }
    }, [payCurrency, getCurrency, activePairs]);

    const fromCurrency = payCurrency;
    const toCurrency = getCurrency;
    const sendAmount = payAmount;

    const { finalAmount, pair, rateString } = useMemo(() => {
        if (sendAmount === '' || sendAmount <= 0) return { finalAmount: 0, pair: null, rateString: 'Enter an amount' };
        
        const foundPair = exchangePairs.find(p => p.from === fromCurrency && p.to === toCurrency);
        if (!foundPair) return { finalAmount: 0, pair: null, rateString: 'Pair not available' };

        if (ratesInitialLoading) return { finalAmount: 0, pair: foundPair, rateString: 'Fetching rate...' };
        const liveRate = getConversionRate(fromCurrency, toCurrency);
        if (liveRate === 0) return { finalAmount: 0, pair: foundPair, rateString: 'Rate unavailable' };

        const feePercentage = foundPair.fee_type === 'percentage' ? foundPair.fee : 0;
        const finalRate = liveRate * (1 - (feePercentage / 100));

        const calculatedFinalAmount = sendAmount * finalRate;
        const rateStr = `1 ${fromCurrency} ≈ ${finalRate.toFixed(6)} ${toCurrency}`;
        
        return { finalAmount: calculatedFinalAmount > 0 ? calculatedFinalAmount : 0, pair: foundPair, rateString: rateStr };
    }, [sendAmount, fromCurrency, toCurrency, exchangePairs, getConversionRate, ratesInitialLoading]);

    const handleAction = () => {
        if (!pair || sendAmount === '' || sendAmount <= 0) {
            toast.error("Please enter a valid amount and select a valid pair.");
            return;
        }
        const params = new URLSearchParams({
            mode,
            from: fromCurrency,
            to: toCurrency,
            amount: sendAmount.toString(),
        });
        navigate(`/buy-sell?${params.toString()}`);
    };

    return (
        <div className="space-y-4 relative">
            <InputRow 
                label={mode === 'buy' ? "You Pay" : "You Sell"}
                amount={payAmount}
                onAmountChange={setPayAmount}
                currency={payCurrency}
                onCurrencyChange={setPayCurrency}
                currencyOptions={fromOptions}
                isInput={true}
            />
            
            <div className="text-xs text-muted-foreground px-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <span>
                        {lastUpdated ? `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}` : 'Live rates'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className={`h-7 ${mode === 'sell' ? 'text-primary' : ''}`} onClick={() => setMode('sell')}>Sell</Button>
                    <Button variant="ghost" size="sm" className={`h-7 ${mode === 'buy' ? 'text-primary' : ''}`} onClick={() => setMode('buy')}>Buy</Button>
                </div>
            </div>

            <InputRow 
                label="You Get"
                amount={finalAmount}
                currency={getCurrency}
                onCurrencyChange={setGetCurrency}
                currencyOptions={toOptions}
                isInput={false}
            />
            <p className="text-xs text-muted-foreground px-2 flex items-center gap-1">
                {isRefetching && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>{ratesInitialLoading ? '...' : rateString}</span>
            </p>

            <Button onClick={handleAction} size="lg" className="w-full h-14 text-lg font-bold mt-6 rounded-xl" disabled={!pair || finalAmount <= 0}>
                {`${mode === 'buy' ? 'Buy' : 'Sell'} ${mode === 'buy' ? getCurrency : payCurrency}`}
            </Button>
        </div>
    );
}
