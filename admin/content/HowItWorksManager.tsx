import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Tables } from '@/lib/database.types';
import DynamicContentManager from '@/components/admin/DynamicContentManager';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

type HowItWorksStep = Tables<'how_it_works_steps'>;

export default function HowItWorksManager() {
    const [steps, setSteps] = useState<HowItWorksStep[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSteps = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('how_it_works_steps').select('*').order('order');
            if (error) {
                toast.error('Failed to fetch "How It Works" steps');
            } else {
                setSteps(data);
            }
            setLoading(false);
        };
        fetchSteps();
    }, []);

    if (loading) {
        return <Card className="glass-card flex items-center justify-center h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin" /></Card>;
    }

    return (
        <DynamicContentManager
            title="How It Works Steps"
            description="Manage the steps in the 'How It Works' section."
            items={steps}
            setItems={setSteps}
            tableName="how_it_works_steps"
            columns={[
                { key: 'order', header: 'Order' },
                { key: 'icon', header: 'Icon' },
                { key: 'title', header: 'Title' },
            ]}
            formFields={[
                { name: 'order', label: 'Order', type: 'number' },
                { name: 'icon', label: 'Icon Name', type: 'text', description: 'Enter a valid icon name from lucide-react (e.g., LogIn, Ticket).' },
                { name: 'title', label: 'Title', type: 'text' },
                { name: 'description', label: 'Description', type: 'textarea' },
            ]}
            hasOrdering={true}
        />
    );
}
