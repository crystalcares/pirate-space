import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminExchangeData } from '../TransactionManagement';
import { Loader2 } from 'lucide-react';
import LiveFeedItem from './LiveFeedItem';
import LiveFeedFilters from './LiveFeedFilters';
import { useNotifications } from '@/hooks/useNotifications';

export default function LiveFeedPanel() {
    const [exchanges, setExchanges] = useState<AdminExchangeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
    const { playSound } = useNotifications();

    const handleNewExchange = useCallback((newExchange: AdminExchangeData) => {
        setExchanges(prev => [newExchange, ...prev]);
        toast.info(`New exchange #${newExchange.exchange_id} created.`);
        playSound('new');
    }, [playSound]);

    const handleUpdateExchange = useCallback((updatedExchange: AdminExchangeData) => {
        setExchanges(prev => prev.map(ex => ex.id === updatedExchange.id ? updatedExchange : ex));
        
        if (updatedExchange.status === 'completed') {
            toast.success(`Exchange #${updatedExchange.exchange_id} completed!`);
            playSound('completed');
        } else if (updatedExchange.status === 'cancelled') {
            toast.error(`Exchange #${updatedExchange.exchange_id} cancelled.`);
            playSound('failed');
        } else {
            toast.info(`Exchange #${updatedExchange.exchange_id} status updated to ${updatedExchange.status}.`);
        }
    }, [playSound]);

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data, error } = await supabase.rpc('get_admin_exchanges');
            if (error) {
                toast.error('Failed to load live feed.');
            } else {
                setExchanges(data || []);
            }
            setLoading(false);
        };

        fetchInitialData();

        const channel = supabase
            .channel('live-feed-exchanges')
            .on<AdminExchangeData>(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'exchanges' },
                (payload) => handleNewExchange(payload.new as AdminExchangeData)
            )
            .on<AdminExchangeData>(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'exchanges' },
                (payload) => handleUpdateExchange(payload.new as AdminExchangeData)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [handleNewExchange, handleUpdateExchange]);

    const filteredExchanges = exchanges.filter(ex => {
        if (filter === 'all') return true;
        return ex.status === filter;
    });

    return (
        <Card className="glass-card h-full">
            <CardHeader>
                <CardTitle>Live Transaction Feed</CardTitle>
                <CardDescription>Real-time updates of all exchange activities.</CardDescription>
                <LiveFeedFilters filter={filter} setFilter={setFilter} />
            </CardHeader>
            <CardContent className="h-[calc(100vh-20rem)] overflow-y-auto pr-3">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {filteredExchanges.length > 0 ? (
                                filteredExchanges.map(exchange => (
                                    <LiveFeedItem key={exchange.id} exchange={exchange} />
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground pt-10">No transactions match the filter.</p>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
