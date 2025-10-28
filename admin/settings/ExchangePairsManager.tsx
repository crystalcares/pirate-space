import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Tables } from '@/lib/database.types';
import DynamicContentManager from '@/components/admin/DynamicContentManager';
import { Loader2 } from 'lucide-react';
import { CurrencyIcon } from '@/lib/currency-icons';
import { useCurrencies } from '@/contexts/CurrencyContext';
import { Card } from '@/components/ui/card';

type ExchangePair = Tables<'exchange_pairs'>;
type PaymentMethod = Tables<'payment_methods'>;

export default function ExchangePairsManager() {
    const [exchangePairs, setExchangePairs] = useState<ExchangePair[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const { currencies, loading: currenciesLoading } = useCurrencies();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [pairsRes, methodsRes] = await Promise.all([
                supabase.from('exchange_pairs').select('*').order('created_at'),
                supabase.from('payment_methods').select('*'),
            ]);

            if (pairsRes.error) toast.error('Failed to fetch exchange pairs');
            else setExchangePairs(pairsRes.data);

            if (methodsRes.error) toast.error('Failed to fetch payment methods');
            else setPaymentMethods(methodsRes.data);
            
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading || currenciesLoading) {
        return <Card className="glass-card flex items-center justify-center h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin" /></Card>;
    }

    const paymentMethodOptions = [
        { value: 'NULL_VALUE', label: 'None' },
        ...paymentMethods.map(p => ({
            value: p.id,
            label: `${p.method} - ${p.details}`
        }))
    ];

    const currencyOptions = currencies.map(c => ({ value: c.symbol, label: c.symbol }));

    return (
        <DynamicContentManager
            title="Exchange Pairs & Fees"
            description="Manage the available exchange pairs and their fees."
            items={exchangePairs}
            setItems={setExchangePairs}
            tableName="exchange_pairs"
            columns={[
                { 
                    key: 'from', 
                    header: 'From',
                    render: (item) => (
                      <div className="flex items-center gap-2 font-medium">
                        <CurrencyIcon symbol={item.from} />
                        <span>{item.from}</span>
                      </div>
                    )
                },
                { 
                    key: 'to', 
                    header: 'To',
                    render: (item) => (
                      <div className="flex items-center gap-2 font-medium">
                        <CurrencyIcon symbol={item.to} />
                        <span>{item.to}</span>
                      </div>
                    )
                },
                { key: 'fee', header: 'Fee/Rate', render: (item) => `${item.fee}${item.fee_type === 'percentage' ? '%' : ''}` },
                { key: 'payment_method_id', header: 'Payment Method', render: (item) => {
                    const method = paymentMethods.find(p => p.id === item.payment_method_id);
                    return method ? method.method : 'None';
                }},
            ]}
            formFields={[
                { name: 'from', label: 'From Currency', type: 'select', selectOptions: currencyOptions },
                { name: 'to', label: 'To Currency', type: 'select', selectOptions: currencyOptions },
                { name: 'fee', label: 'Fee / Rate', type: 'number' },
                { name: 'fee_type', label: 'Fee Type', type: 'select', selectOptions: [{value: 'percentage', label: 'Percentage (%)'}, {value: 'fixed', label: 'Fixed Rate'}] },
                { name: 'payment_method_id', label: 'Required Payment Method', type: 'select', selectOptions: paymentMethodOptions, description: "The payment method users must pay with for this 'From' currency (optional)." },
            ]}
            hasOrdering={false}
        />
    );
}
