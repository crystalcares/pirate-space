import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Tables } from '@/lib/database.types';
import DynamicContentManager from '@/components/admin/DynamicContentManager';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

type Feature = Tables<'features'>;

export default function FeaturesManager() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatures = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('features').select('*').order('order');
            if (error) {
                toast.error('Failed to fetch features');
            } else {
                setFeatures(data);
            }
            setLoading(false);
        };
        fetchFeatures();
    }, []);

    if (loading) {
        return <Card className="glass-card flex items-center justify-center h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin" /></Card>;
    }

    return (
        <DynamicContentManager
            title="Features"
            description="Manage the features section on the landing page."
            items={features}
            setItems={setFeatures}
            tableName="features"
            columns={[
                { key: 'order', header: 'Order' },
                { key: 'icon', header: 'Icon' },
                { key: 'title', header: 'Title' },
            ]}
            formFields={[
                { name: 'order', label: 'Order', type: 'number' },
                { name: 'icon', label: 'Icon Name', type: 'text', description: 'Enter a valid icon name from lucide-react (e.g., Zap, ShieldCheck).' },
                { name: 'title', label: 'Title', type: 'text' },
                { name: 'description', label: 'Description', type: 'textarea' },
            ]}
            hasOrdering={true}
        />
    );
}
