import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Tables } from '@/lib/database.types';
import DynamicContentManager from '@/components/admin/DynamicContentManager';
import { Loader2 } from 'lucide-react';
import { useCurrencies } from '@/contexts/CurrencyContext';
import { CurrencyIcon } from '@/lib/currency-icons';

type TopExchange = Tables<'top_exchanges'>;

export default function TopExchangesManager() {
    const [topExchanges, setTopExchanges] = useState<TopExchange[]>([]);
    const [loading, setLoading] = useState(true);
    const { currencies, loading: currenciesLoading } = useCurrencies();

    useEffect(() => {
        const fetchTopExchanges = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('top_exchanges').select('*').order('order');
            if (error) {
                toast.error('Failed to fetch top exchanges');
            } else {
                setTopExchanges(data);
            }
            setLoading(false);
        };
        fetchTopExchanges();
    }, []);

    if (loading || currenciesLoading) {
        return <div className="flex items-center justify-center h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const currencyOptions = currencies.map(c => ({ value: c.symbol, label: c.symbol }));

    return (
        <DynamicContentManager
            title="Manage Top Exchanges"
            description="Manually add, edit, or remove entries from the 'Top Exchanges' list."
            items={topExchanges}
            setItems={setTopExchanges}
            tableName="top_exchanges"
            columns={[
                { key: 'order', header: 'Order' },
                { 
                    key: 'from_currency_symbol', 
                    header: 'From',
                    render: (item) => (
                      <div className="flex items-center gap-2 font-medium">
                        <CurrencyIcon symbol={item.from_currency_symbol} />
                        <span>{item.from_currency_symbol}</span>
                      </div>
                    )
                },
                { 
                    key: 'to_currency_symbol', 
                    header: 'To',
                    render: (item) => (
                      <div className="flex items-center gap-2 font-medium">
                        <CurrencyIcon symbol={item.to_currency_symbol} />
                        <span>{item.to_currency_symbol}</span>
                      </div>
                    )
                },
                { key: 'volume', header: 'Volume', render: (item) => `$${Number(item.volume).toLocaleString()}` },
            ]}
            formFields={[
                { name: 'order', label: 'Display Order', type: 'number' },
                { name: 'from_currency_symbol', label: 'From Currency', type: 'select', selectOptions: currencyOptions },
                { name: 'to_currency_symbol', label: 'To Currency', type: 'select', selectOptions: currencyOptions },
                { name: 'volume', label: 'Volume ($)', type: 'number' },
            ]}
            hasOrdering={true}
        />
    );
}
