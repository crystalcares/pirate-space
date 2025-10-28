import { useState, useEffect, FC } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, PlusCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Database } from '@/lib/database.types';

type TableKey = keyof Database['public']['Tables'];

interface DynamicContentManagerProps<T extends { id: string; order?: number }> {
    title: string;
    description: string;
    items: T[];
    setItems: React.Dispatch<React.SetStateAction<T[]>>;
    tableName: TableKey;
    columns: { key: keyof T; header: string; render?: (item: T) => React.ReactNode }[];
    formFields: { 
        name: string; 
        label: string; 
        type: 'text' | 'number' | 'textarea' | 'select'; 
        selectOptions?: { value: string; label: string }[];
        description?: string 
    }[];
    hasOrdering: boolean;
}

const DynamicContentManager: FC<DynamicContentManagerProps<any>> = ({ title, description, items, setItems, tableName, columns, formFields, hasOrdering }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [isReordering, setIsReordering] = useState(false);
    const form = useForm();

    useEffect(() => {
        if (isDialogOpen) {
            if (editingItem) {
                form.reset(editingItem);
            } else {
                const defaultValues: any = {};
                if (hasOrdering) {
                    const maxOrder = items.reduce((max, item) => Math.max(item.order || 0, max), 0);
                    defaultValues.order = maxOrder + 1;
                }
                form.reset(defaultValues);
            }
        }
    }, [editingItem, isDialogOpen, items, hasOrdering, form]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) {
            toast.error(error.message);
        } else {
            setItems(currentItems => currentItems.filter((i: { id: string; }) => i.id !== id));
            toast.success('Item deleted.');
        }
    };

    const onSubmit = async (values: FieldValues) => {
        const itemData = { ...values };
        formFields.forEach(field => {
            if (field.type === 'number' && itemData[field.name]) {
                itemData[field.name] = Number(itemData[field.name]);
            }
        });

        if (itemData.payment_method_id === 'NULL_VALUE') {
            itemData.payment_method_id = null;
        }

        const promise = async () => {
            if (editingItem) {
                const { data, error } = await supabase.from(tableName).update(itemData as any).eq('id', editingItem.id).select().single();
                if (error) throw error;
                return data;
            } else {
                const { data, error } = await supabase.from(tableName).insert(itemData as any).select().single();
                if (error) throw error;
                return data;
            }
        };

        toast.promise(promise(), {
            loading: 'Saving item...',
            success: (savedItem: any) => {
                if (editingItem) {
                    setItems(current => current.map((i: { id: any; }) => i.id === savedItem.id ? savedItem : i).sort((a: { order: number; }, b: { order: number; }) => (a.order || 0) - (b.order || 0)));
                } else {
                    setItems(current => [...current, savedItem].sort((a: { order: number; }, b: { order: number; }) => (a.order || 0) - (b.order || 0)));
                }
                setIsDialogOpen(false);
                setEditingItem(null);
                return 'Item saved successfully!';
            },
            error: (err: Error) => `Error: ${err.message}`,
        });
    };
    
    const handleReorder = async (item: any, direction: 'up' | 'down') => {
        if (!hasOrdering) return;
        setIsReordering(true);

        const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
        const currentIndex = sortedItems.findIndex(i => i.id === item.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= sortedItems.length) {
            setIsReordering(false);
            return;
        }

        const itemToMove = sortedItems[currentIndex];
        const otherItem = sortedItems[targetIndex];
        
        const newOrderForCurrent = otherItem.order;
        const newOrderForOther = itemToMove.order;

        const { error: error1 } = await supabase.from(tableName).update({ order: newOrderForCurrent } as any).eq('id', itemToMove.id);
        const { error: error2 } = await supabase.from(tableName).update({ order: newOrderForOther } as any).eq('id', otherItem.id);

        if (error1 || error2) {
            toast.error('Failed to reorder items. Please refresh and try again.');
        } else {
            setItems(currentItems => 
                currentItems.map((i: any) => {
                    if (i.id === itemToMove.id) return { ...i, order: newOrderForCurrent };
                    if (i.id === otherItem.id) return { ...i, order: newOrderForOther };
                    return i;
                }).sort((a: { order: number; }, b: { order: number; }) => (a.order || 0) - (b.order || 0))
            );
            toast.success('Item reordered.');
        }
        setIsReordering(false);
    };

    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingItem(null); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingItem(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Item</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {formFields.map(field => (
                                    <FormField
                                        key={field.name}
                                        control={form.control}
                                        name={field.name}
                                        render={({ field: formField }) => (
                                            <FormItem>
                                                <FormLabel>{field.label}</FormLabel>
                                                <FormControl>
                                                    {field.type === 'textarea' ? (
                                                        <Textarea placeholder={`Enter ${field.label.toLowerCase()}`} {...formField} />
                                                    ) : field.type === 'select' ? (
                                                        <Select onValueChange={formField.onChange} value={formField.value ?? 'NULL_VALUE'}>
                                                            <SelectTrigger><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                                                            <SelectContent>
                                                                {field.selectOptions?.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Input type={field.type} placeholder={`Enter ${field.label.toLowerCase()}`} {...formField} value={formField.value || ''} />
                                                    )}
                                                </FormControl>
                                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <Button type="submit" className="w-full">Save Item</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map(col => <TableHead key={String(col.key)}>{col.header}</TableHead>)}
                            {hasOrdering && <TableHead>Reorder</TableHead>}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item: any, index: number) => (
                            <TableRow key={item.id}>
                                {columns.map(col => (
                                    <TableCell key={String(col.key)}>
                                        {col.render ? col.render(item) : item[col.key]}
                                    </TableCell>
                                ))}
                                {hasOrdering && (
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Button variant="ghost" size="icon" onClick={() => handleReorder(item, 'up')} disabled={index === 0 || isReordering}>
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleReorder(item, 'down')} disabled={index === items.length - 1 || isReordering}>
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
};

export default DynamicContentManager;
