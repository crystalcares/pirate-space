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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const aboutUsKeys = [
    'about_us_hero_title', 'about_us_hero_subtitle', 'about_us_hero_paragraph1', 'about_us_hero_paragraph2',
    'about_us_leadership_title',
] as const;

type AboutUsFormData = Partial<Pick<AppConfig, (typeof aboutUsKeys)[number]>>;

export default function AboutUsManager() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const form = useForm<AboutUsFormData>();

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_config')
                .select('key, value')
                .in('key', aboutUsKeys as unknown as string[]);
            
            if (error) {
                toast.error('Failed to fetch "About Us" content.');
            } else {
                const configObject = data.reduce((acc, { key, value }) => {
                    if ((aboutUsKeys as readonly string[]).includes(key)) {
                        acc[key as keyof AboutUsFormData] = value || '';
                    }
                    return acc;
                }, {} as AboutUsFormData);
                form.reset(configObject);
            }
            setLoading(false);
        };
        fetchContent();
    }, [form]);

    const onSubmit = async (values: AboutUsFormData) => {
        setIsSaving(true);
        const dataToUpsert = Object.entries(values).map(([key, value]) => ({ key, value: value || '' }));

        const { error } = await supabase.from('app_config').upsert(dataToUpsert);

        if (error) {
            toast.error(`Failed to save content: ${error.message}`);
        } else {
            toast.success('"About Us" page content saved successfully!');
        }
        setIsSaving(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const renderField = (name: keyof AboutUsFormData, label: string, type: 'input' | 'textarea' = 'input') => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        {type === 'textarea' ? (
                            <Textarea {...field} value={field.value || ''} rows={3} />
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
                <CardTitle>About Us Page Content</CardTitle>
                <CardDescription>Edit the text content for the "About Us" page.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Accordion type="multiple" defaultValue={['hero', 'leadership']} className="w-full">
                            <AccordionItem value="hero">
                                <AccordionTrigger>Hero Section</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                    {renderField('about_us_hero_title', 'Hero Title')}
                                    {renderField('about_us_hero_subtitle', 'Hero Subtitle', 'textarea')}
                                    {renderField('about_us_hero_paragraph1', 'Hero Paragraph 1', 'textarea')}
                                    {renderField('about_us_hero_paragraph2', 'Hero Paragraph 2', 'textarea')}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="leadership">
                                <AccordionTrigger>Leadership Section</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                    {renderField('about_us_leadership_title', 'Section Title')}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        
                        <Button type="submit" disabled={isSaving} size="lg">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save All Changes
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
