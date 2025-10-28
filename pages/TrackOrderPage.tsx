import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Tables } from '@/lib/database.types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TrackingProgressStepper from '@/components/tracking/TrackingProgressStepper';
import TrackingPaymentCard from '@/components/tracking/TrackingPaymentCard';
import TrackingDetails from '@/components/tracking/TrackingDetails';
import Confetti from '@/components/tracking/Confetti';
import { useDepositWatcher } from '@/hooks/useDepositWatcher';
import { Button } from '@/components/ui/button';

type Exchange = Tables<'exchanges'>;
type PaymentMethod = Tables<'payment_methods'>;

export default function TrackOrderPage() {
    const { id } = useParams<{ id: string }>();
    const [exchange, setExchange] = useState<Exchange | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmations, setConfirmations] = useState<number | null>(null);

    useDepositWatcher(exchange, paymentMethod, setConfirmations);

    useEffect(() => {
        const fetchExchangeDetails = async () => {
            if (!id) {
                setError("No exchange ID provided.");
                setLoading(false);
                return;
            }

            const { data, error: rpcError } = await supabase
                .rpc('get_exchange_details', { p_exchange_id: id });

            if (rpcError) {
                toast.error("Failed to fetch exchange details.");
                console.error(rpcError);
                setError("Could not find the specified exchange.");
                setLoading(false);
                return;
            }

            if (data) {
                setExchange(data.exchange_data);
                setPaymentMethod(data.payment_data);
            } else {
                setError("Exchange not found.");
            }
            setLoading(false);
        };

        fetchExchangeDetails();

        const channel = supabase
            .channel(`exchange-tracking-${id}`)
            .on<Exchange>(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'exchanges', filter: `id=eq.${id}` },
                (payload) => {
                    toast.info(`Exchange status updated to: ${payload.new.status}`);
                    setExchange(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    const showConfetti = exchange?.status === 'completed';

    const renderContent = () => {
        if (loading) {
            return <div className="flex items-center justify-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        }

        if (error || !exchange || !paymentMethod) {
            return (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-destructive mb-4">{error || "Exchange Not Found"}</h2>
                    <p className="text-muted-foreground mb-6">We couldn't find the exchange you're looking for. Please check the ID and try again.</p>
                    <Button asChild><Link to="/exchange">Create a New Exchange</Link></Button>
                </div>
            );
        }

        return (
            <div className="w-full max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Track Your Exchange</h1>
                    <p className="text-muted-foreground mt-2">Exchange ID: <span className="font-mono text-foreground">{exchange.exchange_id}</span></p>
                </div>
                <TrackingProgressStepper currentStatus={exchange.status} confirmations={confirmations} />
                <TrackingPaymentCard exchange={exchange} paymentMethod={paymentMethod} />
                <TrackingDetails exchange={exchange} />
            </div>
        );
    };

    return (
        <div className="bg-muted/20 min-h-screen">
            {showConfetti && <Confetti />}
            <Header />
            <main className="container py-12 sm:py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {renderContent()}
                </motion.div>
                <div className="text-center mt-12">
                    <Button asChild variant="ghost">
                        <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
                    </Button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
