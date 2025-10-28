import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/lib/database.types";
import { CurrencyIcon } from '@/lib/currency-icons';
import { useRates } from '@/contexts/RateContext';
import AnimatedNumericText from '../ui/AnimatedNumericText';

type Exchange = Tables<'exchanges'>;

interface TrackingDetailsProps {
    exchange: Exchange;
}

const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
};

export default function TrackingDetails({ exchange }: TrackingDetailsProps) {
    const [isCopied, setIsCopied] = useState(false);
    const { getConversionRate } = useRates();
    const fiatValue = exchange.send_amount * getConversionRate(exchange.from_currency, 'USD');

    const handleCopy = () => {
        if (!exchange.recipient_wallet_address) return;
        navigator.clipboard.writeText(exchange.recipient_wallet_address);
        setIsCopied(true);
        toast.success("Recipient address copied!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Card className="bg-card/80 backdrop-blur-xl border-border/30">
            <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground">Operation details</h3>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">You send:</span>
                    <div className="flex items-center gap-2">
                        <CurrencyIcon symbol={exchange.from_currency} className="h-5 w-5" />
                        <span className="font-bold text-lg">{exchange.send_amount}</span>
                        <span className="font-semibold">{exchange.from_currency}</span>
                    </div>
                </div>
                 <p className="text-xs text-muted-foreground text-right -mt-2">≈ $<AnimatedNumericText value={fiatValue} precision={2} /></p>
                
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">You get:</span>
                    <div className="flex items-center gap-2">
                        <CurrencyIcon symbol={exchange.to_currency} className="h-5 w-5" />
                        <span className="font-bold text-lg text-primary">≈ {exchange.receive_amount.toFixed(8)}</span>
                        <span className="font-semibold text-primary">{exchange.to_currency}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Recipient address:</span>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <span className="font-mono text-sm">{truncateAddress(exchange.recipient_wallet_address || '')}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                            {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled>
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
