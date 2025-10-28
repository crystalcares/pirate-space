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
import { Textarea } from '@/components/ui/textarea';
import { getPathFromUrl } from '@/lib/utils';

type Testimonial = Tables<'testimonials'>;
const BUCKET_NAME = 'testimonial_avatars';

const formSchema = z.object({
  author: z.string().min(1, "Author name is required"),
  title: z.string().min(1, "Author title is required"),
  content: z.string().min(1, "Content is required"),
  rating: z.coerce.number().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  order: z.coerce.number().int().positive("Order must be a positive integer"),
  avatar_upload: z.instanceof(FileList).optional(),
});

export default function TestimonialsManager() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [isReordering, setIsReordering] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { author: '', title: '', content: '', rating: 5, order: 1 },
    });

    const fetchTestimonials = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('testimonials').select('*').order('order');
        if (error) {
            toast.error(`Failed to fetch testimonials: ${error.message}`);
        } else {
            setTestimonials(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    useEffect(() => {
        if (isDialogOpen) {
            if (editingItem) {
                form.reset({
                    author: editingItem.author,
                    title: editingItem.title,
                    content: editingItem.content,
                    rating: editingItem.rating,
                    order: editingItem.order,
                });
            } else {
                const maxOrder = testimonials.reduce((max, item) => Math.max(item.order || 0, max), 0);
                form.reset({ author: '', title: '', content: '', rating: 5, order: maxOrder + 1, avatar_upload: undefined });
            }
        }
    }, [editingItem, isDialogOpen, testimonials, form]);

    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'T';

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const { avatar_upload, ...otherValues } = values;
        let avatar_url = editingItem?.avatar_url || null;
        const toastId = toast.loading(editingItem ? 'Updating testimonial...' : 'Creating testimonial...');

        try {
            if (avatar_upload && avatar_upload.length > 0) {
                const file = avatar_upload[0];
                const fileExt = file.name.split('.').pop();
                const newFilePath = `${Date.now()}.${fileExt}`;

                if (editingItem?.avatar_url) {
                    const oldPath = getPathFromUrl(editingItem.avatar_url, BUCKET_NAME);
                    if (oldPath) await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
                }

                const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(newFilePath, file);
                if (uploadError) throw uploadError;
                
                const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newFilePath);
                avatar_url = urlData.publicUrl;
            }

            const dataToSubmit: TablesInsert<'testimonials'> | TablesUpdate<'testimonials'> = { ...otherValues, avatar_url };

            const { error } = editingItem
                ? await supabase.from('testimonials').update(dataToSubmit).eq('id', editingItem.id)
                : await supabase.from('testimonials').insert(dataToSubmit as TablesInsert<'testimonials'>);
            
            if (error) throw error;

            toast.success('Testimonial saved!', { id: toastId });
            setIsDialogOpen(false);
            setEditingItem(null);
            fetchTestimonials();

        } catch (error: any) {
            toast.error(`Error: ${error.message}`, { id: toastId });
        }
    };

    const handleDelete = async (item: Testimonial) => {
        if (!window.confirm('Are you sure?')) return;
        
        if (item.avatar_url) {
            const oldPath = getPathFromUrl(item.avatar_url, BUCKET_NAME);
            if (oldPath) await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
        }

        const { error } = await supabase.from('testimonials').delete().eq('id', item.id);
        if (error) toast.error(error.message);
        else {
            toast.success('Testimonial deleted.');
            fetchTestimonials();
        }
    };

    const handleReorder = async (item: Testimonial, direction: 'up' | 'down') => {
        setIsReordering(true);
        const sortedItems = [...testimonials].sort((a, b) => a.order - b.order);
        const currentIndex = sortedItems.findIndex(i => i.id === item.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= sortedItems.length) {
            setIsReordering(false);
            return;
        }

        const otherItem = sortedItems[targetIndex];
        const updates = [
            supabase.from('testimonials').update({ order: otherItem.order }).eq('id', item.id),
            supabase.from('testimonials').update({ order: item.order }).eq('id', otherItem.id)
        ];

        const results = await Promise.all(updates);
        if (results.some(res => res.error)) toast.error('Failed to reorder items.');
        else {
            fetchTestimonials();
            toast.success('Item reordered.');
        }
        setIsReordering(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Testimonials</CardTitle>
                    <CardDescription>Manage customer reviews shown on the landing page.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingItem(null); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingItem(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingItem ? 'Edit' : 'Add'} Testimonial</DialogTitle></DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="order" render={({ field }) => (<FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="author" render={({ field }) => (<FormItem><FormLabel>Author</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Author Title</FormLabel><FormControl><Input placeholder="e.g., Seasoned Trader" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="content" render={({ field }) => (<FormItem><FormLabel>Content</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="rating" render={({ field }) => (<FormItem><FormLabel>Rating (1-5)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="avatar_upload" render={() => (
                                    <FormItem>
                                        <FormLabel>Avatar</FormLabel>
                                        {editingItem?.avatar_url && <img src={editingItem.avatar_url} alt="Current Avatar" className="w-16 h-16 rounded-full border object-cover my-2" />}
                                        <FormControl><Input type="file" accept="image/*" {...form.register('avatar_upload')} /></FormControl>
                                        <FormDescription>Upload a square image for the author.</FormDescription><FormMessage />
                                    </FormItem>
                                )}/>
                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Avatar</TableHead><TableHead>Author</TableHead><TableHead>Rating</TableHead><TableHead>Reorder</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {testimonials.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.order}</TableCell>
                                <TableCell><Avatar><AvatarImage src={item.avatar_url || ''} /><AvatarFallback>{getInitials(item.author)}</AvatarFallback></Avatar></TableCell>
                                <TableCell>{item.author}</TableCell>
                                <TableCell>{item.rating}/5</TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="icon" onClick={() => handleReorder(item, 'up')} disabled={index === 0 || isReordering}><ArrowUp className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleReorder(item, 'down')} disabled={index === testimonials.length - 1 || isReordering}><ArrowDown className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
