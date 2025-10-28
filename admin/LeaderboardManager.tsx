import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tables } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2, PlusCircle, Edit, Trash2, ArrowUp, ArrowDown, Check, ChevronsUpDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn, getPathFromUrl } from '@/lib/utils';

type TopTrader = Tables<'top_traders'> & { user_id: string | null };
type Profile = Tables<'profiles'>;

const BUCKET_NAME = 'top_trader_avatars';

const formSchema = z.object({
  user_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  volume: z.coerce.number().positive("Volume must be a positive number"),
  order: z.coerce.number().int().positive("Order must be a positive integer"),
  avatar_upload: z.instanceof(FileList).optional(),
  avatar_url: z.string().url().nullable().optional(),
});

export default function LeaderboardManager() {
    const { user } = useAuth();
    const [traders, setTraders] = useState<TopTrader[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTrader, setEditingTrader] = useState<TopTrader | null>(null);
    const [isReordering, setIsReordering] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', title: '', volume: 0, order: 1, user_id: null, avatar_url: null },
    });

    const fetchTradersAndProfiles = async () => {
        setLoading(true);
        const [tradersRes, profilesRes] = await Promise.all([
            supabase.from('top_traders').select('*').order('order'),
            supabase.from('profiles').select('id, username, avatar_url')
        ]);
        
        if (tradersRes.data) setTraders(tradersRes.data as TopTrader[]);
        if (tradersRes.error) toast.error('Failed to fetch featured exchangers.');

        if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
        if (profilesRes.error) toast.error('Failed to fetch users.');

        setLoading(false);
    };

    useEffect(() => {
        fetchTradersAndProfiles();
    }, []);

    useEffect(() => {
        if (isDialogOpen) {
            if (editingTrader) {
                form.reset({
                    user_id: editingTrader.user_id,
                    name: editingTrader.name,
                    title: editingTrader.title,
                    volume: editingTrader.volume,
                    order: editingTrader.order,
                    avatar_url: editingTrader.avatar_url,
                });
            } else {
                const maxOrder = traders.reduce((max, item) => Math.max(item.order || 0, max), 0);
                form.reset({ name: '', title: '', volume: 0, order: maxOrder + 1, user_id: null, avatar_url: null, avatar_upload: undefined });
            }
        }
    }, [isDialogOpen, editingTrader, form, traders]);

    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return toast.error("You must be logged in.");

        const { avatar_upload } = values;
        let final_avatar_url = values.avatar_url || null;

        const toastId = toast.loading(editingTrader ? 'Updating exchanger...' : 'Creating exchanger...');

        try {
            if (values.user_id) {
                // User is linked, avatar is already set in form state from selection
                final_avatar_url = values.avatar_url;
            } else if (avatar_upload && avatar_upload.length > 0) {
                const file = avatar_upload[0];
                const fileExt = file.name.split('.').pop();
                const newFilePath = `${user.id}-${Date.now()}.${fileExt}`;

                if (editingTrader?.avatar_url && !editingTrader.user_id) {
                    const oldPath = getPathFromUrl(editingTrader.avatar_url, BUCKET_NAME);
                    if (oldPath) await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
                }

                const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(newFilePath, file);
                if (uploadError) throw uploadError;
                
                const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newFilePath);
                final_avatar_url = urlData.publicUrl;
            }

            const dataToSubmit = {
                user_id: values.user_id || null,
                name: values.name,
                title: values.title,
                volume: values.volume,
                order: values.order,
                avatar_url: final_avatar_url,
            };

            const { error } = editingTrader
                ? await supabase.from('top_traders').update(dataToSubmit as any).eq('id', editingTrader.id)
                : await supabase.from('top_traders').insert(dataToSubmit as any);
            
            if (error) throw error;

            toast.success('Exchanger saved successfully!', { id: toastId });
            setIsDialogOpen(false);
            setEditingTrader(null);
            fetchTradersAndProfiles();

        } catch (error: any) {
            let errorMessage = `Error: ${error.message}`;
            if (error.message.includes('Bucket not found')) {
                errorMessage = 'Storage bucket "top_trader_avatars" not found. Please ensure the migration has been run correctly.';
            } else if (error.message.toLowerCase().includes('security policy')) {
                errorMessage = 'Upload failed due to a security policy. Please ensure you have admin permissions and the storage policies are correct.';
            }
            toast.error(errorMessage, { id: toastId, duration: 10000 });
        }
    };

    const handleDelete = async (trader: TopTrader) => {
        if (!window.confirm('Are you sure you want to delete this exchanger?')) return;
        
        if (trader.avatar_url && !trader.user_id) {
            const oldPath = getPathFromUrl(trader.avatar_url, BUCKET_NAME);
            if (oldPath) {
                await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
            }
        }

        const { error } = await supabase.from('top_traders').delete().eq('id', trader.id);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Exchanger deleted.');
            setTraders(current => current.filter(t => t.id !== trader.id));
        }
    };

    const handleReorder = async (item: TopTrader, direction: 'up' | 'down') => {
        setIsReordering(true);
        const sortedItems = [...traders].sort((a, b) => a.order - b.order);
        const currentIndex = sortedItems.findIndex(i => i.id === item.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= sortedItems.length) {
            setIsReordering(false);
            return;
        }

        const otherItem = sortedItems[targetIndex];
        const updates = [
            supabase.from('top_traders').update({ order: otherItem.order }).eq('id', item.id),
            supabase.from('top_traders').update({ order: item.order }).eq('id', otherItem.id)
        ];

        const results = await Promise.all(updates);
        if (results.some(res => res.error)) {
            toast.error('Failed to reorder items. Please refresh and try again.');
        } else {
            fetchTradersAndProfiles();
            toast.success('Item reordered.');
        }
        setIsReordering(false);
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const selectedUserId = form.watch('user_id');

    return (
        <Card className="bg-card/70 border-border/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Manage Featured Exchangers</CardTitle>
                    <CardDescription>Manually add, edit, or remove featured exchangers on the leaderboard.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingTrader(null); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingTrader(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Exchanger
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTrader ? 'Edit' : 'Add'} Exchanger</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="user_id" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Link to Existing User (Optional)</FormLabel>
                                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                {field.value ? (profiles.find(p => p.id === field.value)?.username || 'Select a user') : "Select a user"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search users..." />
                                            <CommandList>
                                                <CommandEmpty>No user found.</CommandEmpty>
                                                <CommandGroup>
                                                    {profiles.map((profile) => (
                                                        <CommandItem value={profile.username || profile.id} key={profile.id}
                                                            onSelect={() => {
                                                                form.setValue("user_id", profile.id);
                                                                form.setValue("name", profile.username || `User ${profile.id.substring(0,5)}`);
                                                                form.setValue("avatar_url", profile.avatar_url);
                                                                setIsPopoverOpen(false);
                                                            }}>
                                                            <Check className={cn("mr-2 h-4 w-4", profile.id === field.value ? "opacity-100" : "opacity-0")} />
                                                            {profile.username || `User ${profile.id.substring(0,5)}`}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>Linking a user will automatically use their name and avatar.</FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                                {selectedUserId && <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => { form.setValue('user_id', null); form.setValue('name', ''); form.setValue('avatar_url', null); }}>Clear Selection</Button>}
                                
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Jack Sparrow" {...field} value={field.value || ''} disabled={!!selectedUserId} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Captain of the Black Pearl" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="volume" render={({ field }) => (
                                    <FormItem><FormLabel>Volume Traded ($)</FormLabel><FormControl><Input type="number" placeholder="50000" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="order" render={({ field }) => (
                                    <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="avatar_upload" render={() => (
                                    <FormItem>
                                        <FormLabel>Avatar</FormLabel>
                                        {(form.watch('avatar_url')) && (
                                            <div className="mb-2"><p className="text-sm text-muted-foreground">Current:</p><img src={form.watch('avatar_url')!} alt="Current Avatar" className="w-16 h-16 rounded-full border object-cover" /></div>
                                        )}
                                        <FormControl><Input type="file" accept="image/*" {...form.register('avatar_upload')} disabled={!!selectedUserId} /></FormControl>
                                        <FormDescription>Upload an image if not linking to an existing user.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Exchanger
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead><TableHead>Avatar</TableHead><TableHead>Name</TableHead><TableHead>Title</TableHead><TableHead>Volume</TableHead><TableHead>Reorder</TableHead><TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {traders.map((trader, index) => (
                            <TableRow key={trader.id}>
                                <TableCell>{trader.order}</TableCell>
                                <TableCell><Avatar className="h-10 w-10"><AvatarImage src={trader.avatar_url || ''} alt={trader.name} /><AvatarFallback>{getInitials(trader.name)}</AvatarFallback></Avatar></TableCell>
                                <TableCell>{trader.name}</TableCell>
                                <TableCell>{trader.title}</TableCell>
                                <TableCell>${trader.volume.toLocaleString()}</TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="icon" onClick={() => handleReorder(trader, 'up')} disabled={index === 0 || isReordering}><ArrowUp className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleReorder(trader, 'down')} disabled={index === traders.length - 1 || isReordering}><ArrowDown className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingTrader(trader); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(trader)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
