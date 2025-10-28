import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be 20 characters or less'),
});

interface UserSettingsProps {
  onProfileUpdate: () => void;
}

export default function UserSettings({ onProfileUpdate }: UserSettingsProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({ username: profile.username || '' });
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile, form]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const newFileName = `${Date.now()}.${fileExt}`;
    const newFilePath = `${user.id}/${newFileName}`;

    setIsUploading(true);
    
    if (profile?.avatar_url) {
        try {
            const oldPath = new URL(profile.avatar_url).pathname.split('/avatars/')[1];
            if (oldPath) {
                await supabase.storage.from('avatars').remove([oldPath]);
            }
        } catch (e) {
            console.warn("Could not parse or remove old avatar URL", e);
        }
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(newFilePath, file);

    if (uploadError) {
      toast.error(`Failed to upload avatar: ${uploadError.message}`);
      console.error(uploadError);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(newFilePath);

    if (data.publicUrl) {
      setAvatarUrl(data.publicUrl);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);
      
      if (updateError) {
        toast.error('Failed to update profile with new avatar.');
      } else {
        toast.success('Avatar updated successfully!');
        onProfileUpdate();
      }
    }
    setIsUploading(false);
  };

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setIsSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ username: values.username })
      .eq('id', user.id);

    if (error) {
      toast.error(`Failed to update profile: ${error.message}`);
    } else {
      toast.success('Profile updated successfully!');
      onProfileUpdate();
    }
    setIsSaving(false);
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your public profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl || ''} alt={profile?.username || ''} />
                    <AvatarFallback className="text-2xl">{getInitials(profile?.username)}</AvatarFallback>
                  </Avatar>
                  <Button asChild variant="outline">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      Upload Image
                    </label>
                  </Button>
                  <Input id="avatar-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleAvatarUpload} disabled={isUploading} />
                </div>
              </div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ''} disabled />
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
