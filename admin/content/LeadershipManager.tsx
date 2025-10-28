import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2, PlusCircle, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getPathFromUrl } from '@/lib/utils';

type LeadershipMember = Tables<'leadership_team'>;

const BUCKET_NAME = 'leadership_avatars';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().optional(),
  order: z.coerce.number().int().min(1, "Order must be a positive integer"),
  avatar_upload: z.instanceof(FileList).optional(),
  linkedin_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  twitter_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  dribbble_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  metric_value: z.string().optional(),
  metric_label: z.string().optional(),
});

export default function LeadershipManager() {
    const { user } = useAuth();
    const [members, setMembers] = useState<LeadershipMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<LeadershipMember | null>(null);
    const [isReordering, setIsReordering] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { 
            name: '', title: '', bio: '', order: 1, 
            linkedin_url: '', twitter_url: '', dribbble_url: '',
            metric_value: '', metric_label: ''
        },
    });

    const fetchMembers = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('leadership_team').select('*').order('order');
        
        if (data) setMembers(data);
        if (error) toast.error('Failed to fetch leadership team.');
        setLoading(false);
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        if (isDialogOpen) {
            if (editingMember) {
                form.reset({
                    name: editingMember.name,
                    title: editingMember.title,
                    bio: editingMember.bio || '',
                    order: editingMember.order,
                    linkedin_url: editingMember.linkedin_url || '',
                    twitter_url: editingMember.twitter_url || '',
                    dribbble_url: editingMember.dribbble_url || '',
                    metric_value: editingMember.metric_value || '',
                    metric_label: editingMember.metric_label || '',
                });
            } else {
                const maxOrder = members.reduce((max, item) => Math.max(item.order || 0, max), 0);
                form.reset({ 
                    name: '', title: '', bio: '', order: maxOrder + 1,
                    linkedin_url: '', twitter_url: '', dribbble_url: '',
                    metric_value: '', metric_label: ''
                });
            }
        }
    }, [isDialogOpen, editingMember, form, members]);

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return toast.error("You must be logged in.");

        const { avatar_upload, ...otherValues } = values;
        let avatar_url = editingMember?.avatar_url || null;

        const toastId = toast.loading(editingMember ? 'Updating team member...' : 'Adding team member...');

        try {
            if (avatar_upload && avatar_upload.length > 0) {
                const file = avatar_upload[0];
                const fileExt = file.name.split('.').pop();
                const newFilePath = `${user.id}-${Date.now()}.${fileExt}`;

                if (editingMember?.avatar_url) {
                    const oldPath = getPathFromUrl(editingMember.avatar_url, BUCKET_NAME);
                    if (oldPath) await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
                }

                const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(newFilePath, file);
                if (uploadError) throw uploadError;
                
                const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newFilePath);
                avatar_url = urlData.publicUrl;
            }

            const dataToSubmit = { ...otherValues, avatar_url };
            
            // Convert empty strings to null for URL fields
            (Object.keys(dataToSubmit) as Array<keyof typeof dataToSubmit>).forEach(key => {
                if (key.endsWith('_url') && dataToSubmit[key] === '') {
                    (dataToSubmit as any)[key] = null;
                }
            });

            const { error } = editingMember
                ? await supabase.from('leadership_team').update(dataToSubmit as TablesUpdate<'leadership_team'>).eq('id', editingMember.id)
                : await supabase.from('leadership_team').insert(dataToSubmit as TablesInsert<'leadership_team'>);
            
            if (error) throw error;

            toast.success('Team member saved!', { id: toastId });
            setIsDialogOpen(false);
            setEditingMember(null);
            fetchMembers();

        } catch (error: any) {
            let errorMessage = `Error: ${error.message}`;
            if (error.message.includes('Bucket not found')) {
                errorMessage = 'Storage bucket "leadership_avatars" not found. Please run the migration.';
            } else if (error.message.toLowerCase().includes('security policy')) {
                errorMessage = 'Upload failed due to a security policy. Ensure admin permissions are correct.';
            }
            toast.error(errorMessage, { id: toastId, duration: 10000 });
        }
    };

    const handleDelete = async (member: LeadershipMember) => {
        if (!window.confirm('Are you sure you want to delete this team member?')) return;
        
        if (member.avatar_url) {
            const oldPath = getPathFromUrl(member.avatar_url, BUCKET_NAME);
            if (oldPath) await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
        }

        const { error } = await supabase.from('leadership_team').delete().eq('id', member.id);
        if (error) toast.error(error.message);
        else {
            toast.success('Team member deleted.');
            setMembers(current => current.filter(m => m.id !== member.id));
        }
    };

    const handleReorder = async (item: LeadershipMember, direction: 'up' | 'down') => {
        setIsReordering(true);
        const sortedItems = [...members].sort((a, b) => a.order - b.order);
        const currentIndex = sortedItems.findIndex(i => i.id === item.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= sortedItems.length) {
            setIsReordering(false);
            return;
        }

        const otherItem = sortedItems[targetIndex];
        const updates = [
            supabase.from('leadership_team').update({ order: otherItem.order }).eq('id', item.id),
            supabase.from('leadership_team').update({ order: item.order }).eq('id', otherItem.id)
        ];

        const results = await Promise.all(updates);
        if (results.some(res => res.error)) toast.error('Failed to reorder items.');
        else {
            fetchMembers();
            toast.success('Item reordered.');
        }
        setIsReordering(false);
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Leadership Team</CardTitle>
                    <CardDescription>Manage the leadership team members shown on the "About Us" page.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingMember(null); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingMember(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingMember ? 'Edit' : 'Add'} Team Member</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>Basic Info</AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4">
                                            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title / Location</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="order" render={({ field }) => (<FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="avatar_upload" render={() => (
                                                <FormItem>
                                                    <FormLabel>Avatar</FormLabel>
                                                    {editingMember?.avatar_url && <img src={editingMember.avatar_url} alt="Current Avatar" className="w-16 h-16 rounded-full border object-cover my-2" />}
                                                    <FormControl><Input type="file" accept="image/*" {...form.register('avatar_upload')} /></FormControl>
                                                    <FormDescription>Upload a square image.</FormDescription><FormMessage />
                                                </FormItem>
                                            )}/>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-2">
                                        <AccordionTrigger>Social Links</AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4">
                                            <FormField control={form.control} name="linkedin_url" render={({ field }) => (<FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="twitter_url" render={({ field }) => (<FormItem><FormLabel>Twitter/X URL</FormLabel><FormControl><Input placeholder="https://x.com/..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="dribbble_url" render={({ field }) => (<FormItem><FormLabel>Dribbble URL</FormLabel><FormControl><Input placeholder="https://dribbble.com/..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-3">
                                        <AccordionTrigger>Metric / Reward</AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4">
                                            <FormField control={form.control} name="metric_value" render={({ field }) => (<FormItem><FormLabel>Metric Value</FormLabel><FormControl><Input placeholder="e.g., $9,300" {...field} value={field.value || ''} /></FormControl><FormDescription>The main value to display, like an amount.</FormDescription><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="metric_label" render={({ field }) => (<FormItem><FormLabel>Metric Label</FormLabel><FormControl><Input placeholder="e.g., Total Exchanged" {...field} value={field.value || ''} /></FormControl><FormDescription>The label below the value.</FormDescription><FormMessage /></FormItem>)}/>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Member
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
                            <TableHead>Order</TableHead><TableHead>Avatar</TableHead><TableHead>Name</TableHead><TableHead>Title</TableHead><TableHead>Reorder</TableHead><TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member, index) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.order}</TableCell>
                                <TableCell><Avatar><AvatarImage src={member.avatar_url || ''} /><AvatarFallback>{getInitials(member.name)}</AvatarFallback></Avatar></TableCell>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>{member.title}</TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="icon" onClick={() => handleReorder(member, 'up')} disabled={index === 0 || isReordering}><ArrowUp className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleReorder(member, 'down')} disabled={index === members.length - 1 || isReordering}><ArrowDown className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingMember(member); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
