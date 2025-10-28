import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Tables } from '@/lib/database.types';
import DynamicContentManager from '@/components/admin/DynamicContentManager';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

type FaqItem = Tables<'faq_items'>;

export default function FaqManager() {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('faq_items').select('*').order('order');
            if (error) {
                toast.error('Failed to fetch FAQs');
            } else {
                setFaqs(data);
            }
            setLoading(false);
        };
        fetchFaqs();
    }, []);

    if (loading) {
        return <Card className="glass-card flex items-center justify-center h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin" /></Card>;
    }

    return (
        <DynamicContentManager
            title="FAQ Items"
            description="Manage the questions and answers in the FAQ section."
            items={faqs}
            setItems={setFaqs}
            tableName="faq_items"
            columns={[
                { key: 'order', header: 'Order' },
                { key: 'question', header: 'Question' },
            ]}
            formFields={[
                { name: 'order', label: 'Order', type: 'number' },
                { name: 'question', label: 'Question', type: 'text' },
                { name: 'answer', label: 'Answer', type: 'textarea' },
            ]}
            hasOrdering={true}
        />
    );
}
