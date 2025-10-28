import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { AppConfig } from '@/contexts/AppConfigContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Label } from '@/components/ui/label';
import { getPathFromUrl } from '@/lib/utils';

const themeConfigKeys = [
    'ship_image_url', 'trustpilot_brand_name', 'trustpilot_icon_url', 'trustpilot_rating', 'trustpilot_reviews_count',
    'faq_image_url', 'footer_social_twitter_url', 
    'footer_social_telegram_url', 'footer_copyright_text', 'leaderboard_tab1_title', 'leaderboard_tab2_title'
];

export default function ThemeEditor() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingShip, setIsUploadingShip] = useState(false);
    const form = useForm<AppConfig>();

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('app_config').select('key, value');
            
            if (error) {
                toast.error('Failed to fetch theme settings.');
            } else {
                const configObject = data.reduce((acc, { key, value }) => {
                    if (themeConfigKeys.includes(key)) {
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

    const handleShipImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const newFilePath = `ship-image-${Date.now()}.${fileExt}`;
        const BUCKET_NAME = 'site_assets';

        setIsUploadingShip(true);
        const toastId = toast.loading('Uploading new ship image...');

        try {
            const currentShipUrl = form.getValues('ship_image_url');
            if (currentShipUrl) {
                const oldPath = getPathFromUrl(currentShipUrl, BUCKET_NAME);
                if (oldPath) {
                    await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
                }
            }

            const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(newFilePath, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newFilePath);
            const newShipUrl = urlData.publicUrl;

            form.setValue('ship_image_url', newShipUrl);
            toast.success('Ship image updated! Save settings to apply.', { id: toastId });

        } catch (error: any) {
            toast.error(`Failed to upload image: ${error.message}`, { id: toastId, duration: 8000 });
        } finally {
            setIsUploadingShip(false);
        }
    };

    const onSubmit = async (values: AppConfig) => {
        setIsSaving(true);
        const dataToUpsert = Object.entries(values)
            .filter(([key]) => themeConfigKeys.includes(key))
            .map(([key, value]) => ({ key, value }));

        const { error } = await supabase.from('app_config').upsert(dataToUpsert);

        if (error) {
            toast.error(`Failed to save settings: ${error.message}`);
        } else {
            toast.success('Theme settings saved successfully! Refresh may be needed to see all changes.');
        }
        setIsSaving(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const renderField = (name: keyof AppConfig, label: string, description?: string) => (
        <FormField
            control={form.control}
            name={name as string}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Appearance & Theme</CardTitle>
                <CardDescription>Customize the look and feel of your site.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Accordion type="multiple" defaultValue={['item-2', 'item-3', 'item-4', 'item-5']} className="w-full">
                            
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Hero Section</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>Ship Image</Label>
                                        <div className="flex items-center gap-4">
                                            {form.watch('ship_image_url') && <img src={form.watch('ship_image_url')} alt="Current ship" className="h-20 w-20 object-contain rounded-md border bg-muted p-1" />}
                                            <Button asChild variant="outline">
                                                <label htmlFor="ship-upload" className="cursor-pointer">
                                                    {isUploadingShip ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                                    Upload Ship
                                                </label>
                                            </Button>
                                            <Input id="ship-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/gif, image/svg+xml" onChange={handleShipImageUpload} disabled={isUploadingShip} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">Upload a new image for the hero section ship.</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger>Components</AccordionTrigger>
                                <AccordionContent className="space-y-6 pt-4">
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold mb-4">Trustpilot Widget</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {renderField('trustpilot_brand_name', 'Brand Name (e.g., Trustpilot)')}
                                            {renderField('trustpilot_icon_url', 'Icon URL')}
                                            {renderField('trustpilot_rating', 'Rating (e.g., 4.5)')}
                                            {renderField('trustpilot_reviews_count', 'Reviews Count (e.g., 12,887)')}
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold mb-2">FAQ Section</h4>
                                        {renderField('faq_image_url', 'Image URL', 'URL for the image displayed next to the FAQ list.')}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger>Leaderboard</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                    {renderField('leaderboard_tab1_title', 'Tab 1 Title (e.g., Top Exchangers)')}
                                    {renderField('leaderboard_tab2_title', 'Tab 2 Title (e.g., Featured Exchangers)')}
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-5">
                                <AccordionTrigger>Footer</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                    {renderField('footer_social_twitter_url', 'Twitter/X URL')}
                                    {renderField('footer_social_telegram_url', 'Telegram URL')}
                                    {renderField('footer_copyright_text', 'Copyright Text')}
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                        
                        <Button type="submit" disabled={isSaving} size="lg">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Appearance Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
