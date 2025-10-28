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
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrencies } from '@/contexts/CurrencyContext';
import { getPathFromUrl } from '@/lib/utils';

type Currency = Tables<'currencies'>;
const BUCKET_NAME = 'site_assets';
const FOLDER_NAME = 'currency_icons';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol is too long"),
  type: z.enum(['crypto', 'fiat']),
  icon_upload: z.instanceof(FileList).optional(),
});

export default function CurrencyManager() {
    const { currencies, refetch: refetchCurrencies, loading: currenciesLoading } = useCurrencies();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', symbol: '', type: 'crypto' },
    });

    useEffect(() => {
        if (isDialogOpen) {
            if (editingCurrency) {
                form.reset({
                    name: editingCurrency.name,
                    symbol: editingCurrency.symbol,
                    type: editingCurrency.type,
                });
            } else {
                form.reset({ name: '', symbol: '', type: 'crypto' });
            }
        }
    }, [isDialogOpen, editingCurrency, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const { icon_upload, ...otherValues } = values;
        let icon_url = editingCurrency?.icon_url || null;

        const toastId = toast.loading(editingCurrency ? 'Updating currency...' : 'Creating currency...');

        try {
            if (icon_upload && icon_upload.length > 0) {
                const file = icon_upload[0];
                const fileExt = file.name.split('.').pop();
                const newFilePath = `${FOLDER_NAME}/${Date.now()}.${fileExt}`;

                if (editingCurrency?.icon_url) {
                    const oldPath = getPathFromUrl(editingCurrency.icon_url, BUCKET_NAME);
                    if (oldPath) await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
                }

                const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(newFilePath, file);
                if (uploadError) throw uploadError;
                
                const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newFilePath);
                icon_url = urlData.publicUrl;
            }

            const dataToSubmit = { ...otherValues, symbol: otherValues.symbol.toUpperCase(), icon_url };

            const { error } = editingCurrency
                ? await supabase.from('currencies').update(dataToSubmit as TablesUpdate<'currencies'>).eq('id', editingCurrency.id)
                : await supabase.from('currencies').insert(dataToSubmit as TablesInsert<'currencies'>);

            if (error) throw error;

            toast.success('Currency saved!', { id: toastId });
            setIsDialogOpen(false);
            setEditingCurrency(null);
            refetchCurrencies();
        } catch (error: any) {
            toast.error(`Error: ${error.message}`, { id: toastId });
        }
    };

    const handleDelete = async (currency: Currency) => {
        if (!window.confirm('Are you sure? This might affect existing exchange pairs.')) return;
        
        if (currency.icon_url) {
            const oldPath = getPathFromUrl(currency.icon_url, BUCKET_NAME);
            if (oldPath) await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
        }

        const { error } = await supabase.from('currencies').delete().eq('id', currency.id);
        if (error) toast.error(error.message);
        else {
            toast.success('Currency deleted.');
            refetchCurrencies();
        }
    };
    
    if (currenciesLoading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Manage Currencies</CardTitle>
                    <CardDescription>Add, edit, or remove supported currencies.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingCurrency(null); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingCurrency(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Currency
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingCurrency ? 'Edit' : 'Add'} Currency</DialogTitle></DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Bitcoin" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="symbol" render={({ field }) => (<FormItem><FormLabel>Symbol</FormLabel><FormControl><Input placeholder="e.g., BTC" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="type" render={({ field }) => (
                                    <FormItem><FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="crypto">Crypto</SelectItem><SelectItem value="fiat">Fiat</SelectItem></SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="icon_upload" render={() => (
                                    <FormItem>
                                        <FormLabel>Icon</FormLabel>
                                        {editingCurrency?.icon_url && <img src={editingCurrency.icon_url} alt="Current icon" className="w-10 h-10 rounded-full border bg-white p-1 my-2" />}
                                        <FormControl><Input type="file" accept="image/*" {...form.register('icon_upload')} /></FormControl>
                                        <FormDescription>Upload a square image (e.g., PNG, SVG).</FormDescription><FormMessage />
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
                    <TableHeader><TableRow><TableHead>Icon</TableHead><TableHead>Name</TableHead><TableHead>Symbol</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {currencies.map((currency) => (
                            <TableRow key={currency.id}>
                                <TableCell><Avatar className="h-8 w-8"><AvatarImage src={currency.icon_url || ''} /><AvatarFallback>{currency.symbol.charAt(0)}</AvatarFallback></Avatar></TableCell>
                                <TableCell>{currency.name}</TableCell>
                                <TableCell>{currency.symbol}</TableCell>
                                <TableCell className="capitalize">{currency.type}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingCurrency(currency); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(currency)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
