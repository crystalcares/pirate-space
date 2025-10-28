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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getPathFromUrl } from '@/lib/utils';

type PaymentMethod = Tables<'payment_methods'>;

const BUCKET_NAME = 'qrcodes';

const formSchema = z.object({
  method: z.string().min(1, "Method is required"),
  detail_type: z.string().min(1, "Type is required"),
  details: z.string().min(1, "Details are required"),
  qr_code_upload: z.instanceof(FileList).optional(),
});

export default function PaymentSettings() {
    const { user } = useAuth();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { method: '', detail_type: '', details: '' },
    });

    const fetchPaymentMethods = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('payment_methods').select('*').order('created_at');
        
        if (data) setPaymentMethods(data);
        if (error) toast.error('Failed to fetch payment methods.');
        setLoading(false);
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    useEffect(() => {
        if (isDialogOpen) {
            if (editingMethod) {
                form.reset({
                    method: editingMethod.method,
                    detail_type: editingMethod.detail_type,
                    details: editingMethod.details,
                });
            } else {
                form.reset({ method: '', detail_type: '', details: '' });
            }
        }
    }, [isDialogOpen, editingMethod, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return toast.error("You must be logged in.");

        const { qr_code_upload, ...otherValues } = values;
        let qr_code_url = editingMethod?.qr_code_url || null;

        const toastId = toast.loading(editingMethod ? 'Updating payment method...' : 'Creating payment method...');

        if (qr_code_upload && qr_code_upload.length > 0) {
            const file = qr_code_upload[0];
            const fileExt = file.name.split('.').pop();
            const newFilePath = `${Date.now()}.${fileExt}`;

            if (editingMethod?.qr_code_url) {
                const oldPath = getPathFromUrl(editingMethod.qr_code_url, BUCKET_NAME);
                if (oldPath) {
                    await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
                }
            }

            const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(newFilePath, file);

            if (uploadError) {
                return toast.error(`Upload failed: ${uploadError.message}`, { id: toastId });
            }
            
            const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newFilePath);
            qr_code_url = urlData.publicUrl;
        }

        const dataToSubmit = { ...otherValues, qr_code_url };

        let error;
        if (editingMethod) {
            const { error: updateError } = await supabase.from('payment_methods').update(dataToSubmit as TablesUpdate<'payment_methods'>).eq('id', editingMethod.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('payment_methods').insert(dataToSubmit as TablesInsert<'payment_methods'>);
            error = insertError;
        }

        if (error) {
            toast.error(`Error: ${error.message}`, { id: toastId });
        } else {
            toast.success('Payment method saved successfully!', { id: toastId });
            setIsDialogOpen(false);
            setEditingMethod(null);
            fetchPaymentMethods();
        }
    };

    const handleDelete = async (id: string, qrCodeUrl: string | null) => {
        if (!window.confirm('Are you sure you want to delete this payment method?')) return;
        
        if (qrCodeUrl) {
            const oldPath = getPathFromUrl(qrCodeUrl, BUCKET_NAME);
            if (oldPath) {
                await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
            }
        }

        const { error } = await supabase.from('payment_methods').delete().eq('id', id);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Payment method deleted.');
            setPaymentMethods(current => current.filter(m => m.id !== id));
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage payment details for receiving funds from users.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingMethod(null); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingMethod(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingMethod ? 'Edit' : 'Add'} Payment Method</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="method" render={({ field }) => (
                                    <FormItem><FormLabel>Method</FormLabel><FormControl><Input placeholder="e.g., PayPal, BTC, UPI" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="detail_type" render={({ field }) => (
                                    <FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="e.g., Email, Wallet Address, UPI ID" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="details" render={({ field }) => (
                                    <FormItem><FormLabel>Details</FormLabel><FormControl><Input placeholder="The actual address, ID, or email" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="qr_code_upload" render={() => (
                                    <FormItem>
                                        <FormLabel>QR Code Image</FormLabel>
                                        {editingMethod?.qr_code_url && (
                                            <div className="mb-2">
                                                <p className="text-sm text-muted-foreground">Current QR Code:</p>
                                                <img src={editingMethod.qr_code_url} alt="Current QR Code" className="w-24 h-24 rounded-md border object-contain bg-white p-1" />
                                            </div>
                                        )}
                                        <FormControl><Input type="file" accept="image/*" {...form.register('qr_code_upload')} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Method
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
                            <TableHead>Method</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>QR Code</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentMethods.map((method) => (
                            <TableRow key={method.id}>
                                <TableCell>{method.method}</TableCell>
                                <TableCell>{method.detail_type}</TableCell>
                                <TableCell className="font-mono text-xs">{method.details}</TableCell>
                                <TableCell>
                                    {method.qr_code_url ? (
                                        <Avatar className="h-10 w-10 rounded-md">
                                            <AvatarImage src={method.qr_code_url} alt="QR Code" className="object-contain" />
                                            <AvatarFallback className="rounded-md">QR</AvatarFallback>
                                        </Avatar>
                                    ) : 'None'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingMethod(method); setIsDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id, method.qr_code_url)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
