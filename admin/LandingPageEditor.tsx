import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AppConfig } from '@/contexts/AppConfigContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const contentKeys = [
    'site_name', 'hero_badge', 'hero_title', 'hero_subtitle', 'hero_cta1_text', 'hero_cta2_text',
    'features_title', 'features_subtitle', 'calculator_title', 'calculator_subtitle',
    'top_traders_title', 'top_traders_subtitle', 'testimonials_title', 'testimonials_subtitle',
    'how_it_works_title', 'how_it_works_subtitle', 'faq_title', 'faq_subtitle'
];

export default function LandingPageEditor() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const form = useForm<AppConfig>();

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('app_config').select('key, value');
            
            if (error) {
                toast.error('Failed to fetch landing page content.');
            } else {
                const configObject = data.reduce((acc, { key, value }) => {
                    if (contentKeys.includes(key)) {
                        acc[key] = value || '';
                    }
                    return acc;
                }, {} as AppConfig);
                form.reset(configObject);
            }
            setLoading(false);
        };
        fetchContent();
    }, [form]);

    const onSubmit = async (values: AppConfig) => {
        setIsSaving(true);
        const dataToUpsert = Object.entries(values).map(([key, value]) => ({ key, value }));

        const { error } = await supabase.from('app_config').upsert(dataToUpsert);

        if (error) {
            toast.error(`Failed to save content: ${error.message}`);
        } else {
            toast.success('Landing page content saved successfully!');
        }
        setIsSaving(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const renderField = (name: keyof AppConfig, label: string, type: 'input' | 'textarea' = 'input') => (
        <FormField
            control={form.control}
            name={name as string}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        {type === 'textarea' ? (
                            <Textarea {...field} value={field.value || ''} />
                        ) : (
                            <Input {...field} value={field.value || ''} />
                        )}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Landing Page Content</CardTitle>
                <CardDescription>Edit the text content displayed on the main landing page.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>General & Hero Section</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                    {renderField('site_name', 'Site Name (in Header)')}
                                    {renderField('hero_badge', 'Hero Badge Text')}
                                    {renderField('hero_title', 'Hero Title')}
                                    {renderField('hero_subtitle', 'Hero Subtitle', 'textarea')}
                                    {renderField('hero_cta1_text', 'Hero Primary Button Text')}
                                    {renderField('hero_cta2_text', 'Hero Secondary Button Text')}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Content Sections</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">{renderField('features_title', 'Features Title')}{renderField('features_subtitle', 'Features Subtitle')}</div>
                                        <div className="space-y-4">{renderField('calculator_title', 'Calculator Title')}{renderField('calculator_subtitle', 'Calculator Subtitle')}</div>
                                        <div className="space-y-4">{renderField('top_traders_title', 'Top Traders Title')}{renderField('top_traders_subtitle', 'Top Traders Subtitle')}</div>
                                        <div className="space-y-4">{renderField('testimonials_title', 'Testimonials Title')}{renderField('testimonials_subtitle', 'Testimonials Subtitle')}</div>
                                        <div className="space-y-4">{renderField('how_it_works_title', 'How It Works Title')}{renderField('how_it_works_subtitle', 'How It Works Subtitle')}</div>
                                        <div className="space-y-4">{renderField('faq_title', 'FAQ Title')}{renderField('faq_subtitle', 'FAQ Subtitle')}</div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save All Changes
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
