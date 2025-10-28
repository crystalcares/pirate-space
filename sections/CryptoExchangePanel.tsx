import { useState, useMemo, useEffect, FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
                    placeholder="1.0" 
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

export default function CryptoExchangePanel() {
    const { exchangePairs } = useExchangeConfig();
    const { currencies } = useCurrencies();
    const { getConversionRate, loading: ratesInitialLoading, isRefetching, lastUpdated } = useRates();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const initialAmount = searchParams.get('amount');
    const [sendAmount, setSendAmount] = useState<number | ''>(initialAmount ? parseFloat(initialAmount) : 1);
    
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
        
        const isValidPair = cryptoPairs.some(p => p.from === currentFrom && p.to === currentTo);

        if (!isValidPair) {
            const firstPair = cryptoPairs[0];
            if (firstPair) {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('from', firstPair.from);
                newParams.set('to', firstPair.to);
                setSearchParams(newParams, { replace: true });
            }
        }
    }, [cryptoPairs, searchParams, setSearchParams]);

    const handleFromCurrencyChange = (newFrom: string) => {
        const newToOptions = cryptoPairs.filter(p => p.from === newFrom).map(p => p.to);
        const newTo = newToOptions[0] || '';
        const newParams = new URLSearchParams(searchParams);
        newParams.set('from', newFrom);
        newParams.set('to', newTo);
        setSearchParams(newParams);
    };
    
    const handleToCurrencyChange = (newTo: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('to', newTo);
        setSearchParams(newParams);
    };

    const { finalAmount, pair, rateString } = useMemo(() => {
        if (sendAmount === '' || sendAmount <= 0) return { finalAmount: 0, pair: null, rateString: 'Enter an amount' };
        
        const foundPair = cryptoPairs.find(p => p.from === fromCurrency && p.to === toCurrency);
        if (!foundPair) return { finalAmount: 0, pair: null, rateString: 'Pair not available' };

        if (ratesInitialLoading) return { finalAmount: 0, pair: foundPair, rateString: 'Fetching rate...' };
        const liveRate = getConversionRate(fromCurrency, toCurrency);
        if (liveRate === 0) return { finalAmount: 0, pair: foundPair, rateString: 'Rate unavailable' };

        const feePercentage = foundPair.fee_type === 'percentage' ? foundPair.fee : 0;
        const finalRate = liveRate * (1 - (feePercentage / 100));
        
        const calculatedFinalAmount = sendAmount * finalRate;
        const rateStr = `1 ${fromCurrency} ≈ ${finalRate.toFixed(6)} ${toCurrency}`;
        
        return { finalAmount: calculatedFinalAmount > 0 ? calculatedFinalAmount : 0, pair: foundPair, rateString: rateStr };
    }, [sendAmount, fromCurrency, toCurrency, cryptoPairs, getConversionRate, ratesInitialLoading]);
    
    const handleStartExchange = () => {
        if (!fromCurrency || !toCurrency) {
            toast.error("Please select a valid pair.");
            return;
        }
        const newParams = new URLSearchParams();
        newParams.set('from', fromCurrency);
        newParams.set('to', toCurrency);
        if (sendAmount) {
            newParams.set('amount', sendAmount.toString());
        }
        navigate(`/exchange?${newParams.toString()}`);
    };

    return (
        <div className="space-y-4">
            <InputRow 
                label="You Send"
                amount={sendAmount}
                onAmountChange={setSendAmount}
                currency={fromCurrency}
                onCurrencyChange={handleFromCurrencyChange}
                currencyOptions={uniqueFromCurrencies}
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
                <div className="flex items-center gap-1">
                    {isRefetching && <Loader2 className="h-3 w-3 animate-spin" />}
                    <span>{ratesInitialLoading ? '...' : rateString}</span>
                </div>
            </div>

            <InputRow 
                label="You Get"
                amount={finalAmount}
                currency={toCurrency}
                onCurrencyChange={handleToCurrencyChange}
                currencyOptions={availableToCurrencies}
                isInput={false}
            />

            <Button onClick={handleStartExchange} size="lg" className="w-full h-14 text-lg font-bold mt-6 rounded-xl" disabled={!pair}>
                Exchange
            </Button>
        </div>
    );
}
