import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Copy, Check, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/lib/database.types";
import { CurrencyIcon } from '@/lib/currency-icons';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';

type Exchange = Tables<'exchanges'>;
type PaymentMethod = Tables<'payment_methods'>;

interface TrackingPaymentCardProps {
    exchange: Exchange;
    paymentMethod: PaymentMethod;
}

const EXPIRATION_MINUTES = 60;

export default function TrackingPaymentCard({ exchange, paymentMethod }: TrackingPaymentCardProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const expirationTime = new Date(new Date(exchange.created_at).getTime() + EXPIRATION_MINUTES * 60 * 1000);
        
        const interval = setInterval(() => {
            const now = new Date();
            const secondsLeft = differenceInSeconds(expirationTime, now);

            if (secondsLeft <= 0) {
                setTimeLeft('Expired');
                clearInterval(interval);
            } else {
                setTimeLeft(formatDistanceToNowStrict(expirationTime, { addSuffix: true }));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [exchange.created_at]);

    const handleCopy = () => {
        navigator.clipboard.writeText(paymentMethod.details);
        setIsCopied(true);
        toast.success("Deposit address copied!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    const qrValue = `${exchange.from_currency.toLowerCase()}:${paymentMethod.details}?amount=${exchange.send_amount}`;

    if (exchange.status !== 'pending') {
        return (
            <Card className="bg-green-500/10 border-green-500/20 text-center p-8">
                <Check className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-foreground">Payment Detected</h3>
                <p className="text-muted-foreground text-sm">We have detected your payment. Please wait for blockchain confirmation.</p>
            </Card>
        );
    }

    return (
        <Card className="bg-muted/50 border-border/50">
            <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Expires in:</span>
                    <div className="flex items-center gap-2 font-semibold text-yellow-400">
                        <Clock className="h-4 w-4" />
                        <span>{timeLeft}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Send deposit:</span>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{exchange.send_amount}</span>
                        <CurrencyIcon symbol={exchange.from_currency} className="h-5 w-5" />
                        <span className="font-semibold">{exchange.from_currency}</span>
                    </div>
                </div>

                <div className="grid sm:grid-cols-[140px_1fr] gap-4 items-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-2 bg-white rounded-lg border-4 border-muted">
                            <QRCode value={qrValue} size={112} bgColor="#ffffff" fgColor="#000000" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Deposit address:</label>
                        <div className="p-3 bg-background border rounded-md font-mono text-sm break-all">
                            {paymentMethod.details}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCopy} variant="secondary" className="w-full">
                                {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                Copy Address
                            </Button>
                            <Button variant="outline" className="w-full" disabled>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Wallet
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
