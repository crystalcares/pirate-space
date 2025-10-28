import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { getPathFromUrl } from '@/lib/utils';

export default function GeneralSettings() {
    const [loading, setLoading] = useState(true);
    const [discordUrl, setDiscordUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const appConfig = useAppConfig();

    useEffect(() => {
        if (appConfig) {
            setDiscordUrl(appConfig.discordInviteUrl || '');
            setLogoUrl(appConfig.site_logo_url || '');
            setLoading(false);
        }
    }, [appConfig]);

    const handleUpdateDiscordLink = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('app_config').upsert({ key: 'discordInviteUrl', value: discordUrl });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Discord invite link updated!');
        }
        setIsSaving(false);
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const newFilePath = `logo-${Date.now()}.${fileExt}`;
        const BUCKET_NAME = 'site_assets';

        setIsUploadingLogo(true);
        const toastId = toast.loading('Uploading new logo...');

        try {
            if (logoUrl) {
                const oldPath = getPathFromUrl(logoUrl, BUCKET_NAME);
                if (oldPath) {
                    await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
                }
            }

            const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(newFilePath, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newFilePath);
            const newLogoUrl = urlData.publicUrl;

            const { error: dbError } = await supabase.from('app_config').upsert({ key: 'site_logo_url', value: newLogoUrl });
            if (dbError) throw dbError;

            setLogoUrl(newLogoUrl);
            toast.success('Logo updated successfully! Refresh to see changes site-wide.', { id: toastId });

        } catch (error: any) {
            let errorMessage = 'An unexpected error occurred.';
            if (error.message.includes('Bucket not found')) {
                errorMessage = 'Storage bucket "site_assets" not found. Please run the required database migration.';
            } else if (error.message.toLowerCase().includes('security policy')) {
                errorMessage = 'Upload failed due to a security policy. Ensure you have admin permissions and correct storage policies.';
            } else {
                errorMessage = `Failed to upload logo: ${error.message}`;
            }
            toast.error(errorMessage, { id: toastId, duration: 10000 });
        } finally {
            setIsUploadingLogo(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage site-wide configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-2">
                    <Label htmlFor="discordLink">Discord Invite Link</Label>
                    <div className="flex gap-2">
                        <Input id="discordLink" value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} />
                        <Button onClick={handleUpdateDiscordLink} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label>Site Logo</Label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 flex items-center justify-center rounded-md border bg-muted">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Current Logo" className="h-16 w-16 object-contain" />
                            ) : (
                                <span className="text-xs text-muted-foreground">No Logo</span>
                            )}
                        </div>
                        <Button asChild variant="outline">
                            <label htmlFor="logo-upload" className="cursor-pointer">
                                {isUploadingLogo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Upload New Logo
                            </label>
                        </Button>
                        <Input id="logo-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/gif, image/svg+xml" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                    </div>
                    <p className="text-sm text-muted-foreground">Recommended: Square image (e.g., 256x256px) in SVG, PNG, or GIF format.</p>
                </div>
            </CardContent>
        </Card>
    );
}
