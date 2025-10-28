import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Loader2, MoreHorizontal, Copy, Check, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Database, Tables } from '@/lib/database.types';
import AdminPageHeader from './ui/AdminPageHeader';
import FilterInput from './ui/FilterInput';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { sendExchangeStatusUpdateWebhook } from '@/lib/discord';

export type AdminExchangeData = Database['public']['Functions']['get_admin_exchanges']['Returns'][number];
type PaymentMethod = Tables<'payment_methods'>;

const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles: { [key: string]: string } = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      confirming: 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse',
      exchanging: 'bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse',
      sending: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 animate-pulse',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return <Badge variant="outline" className={`capitalize ${statusStyles[status] || 'bg-muted'}`}>{status}</Badge>;
};

export default function TransactionManagement() {
    const { user } = useAuth();
    const [exchanges, setExchanges] = useState<AdminExchangeData[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const paymentMethodMap = useMemo(() => {
        return paymentMethods.reduce((acc, method) => {
            acc[method.id] = method.method;
            return acc;
        }, {} as Record<string, string>);
    }, [paymentMethods]);

    const fetchExchanges = async () => {
        // Only set loading true on initial fetch
        if (exchanges.length === 0) setLoading(true);

        const [exchangesRes, paymentMethodsRes] = await Promise.all([
            supabase.rpc('get_admin_exchanges'),
            supabase.from('payment_methods').select('*')
        ]);
        
        if (exchangesRes.error) {
            const errorMessage = `Failed to fetch exchanges. DB Error: "${exchangesRes.error.message}"`;
            toast.error(errorMessage);
            console.error("Transaction Management fetch error:", exchangesRes.error);
        } else {
            setExchanges(exchangesRes.data || []);
        }

        if (paymentMethodsRes.error) {
            toast.error(`Failed to fetch payment methods: ${paymentMethodsRes.error.message}`);
        } else {
            setPaymentMethods(paymentMethodsRes.data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchExchanges();

        const channel = supabase
          .channel('admin-exchanges-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'exchanges' },
            (payload) => {
              console.log('Admin order change received!', payload);
              toast.info('Orders list has been updated.');
              fetchExchanges();
            }
          )
          .subscribe();
    
        return () => {
          supabase.removeChannel(channel);
        };
      }, []);

    const filteredExchanges = useMemo(() => {
        if (!searchTerm) return exchanges;
        const lowercasedTerm = searchTerm.toLowerCase();
        return exchanges.filter(ex => 
            ex.username?.toLowerCase().includes(lowercasedTerm) ||
            ex.email?.toLowerCase().includes(lowercasedTerm) ||
            ex.exchange_id.toLowerCase().includes(lowercasedTerm) ||
            ex.recipient_wallet_address?.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, exchanges]);

    const handleUpdateStatus = async (id: string, newStatus: 'completed' | 'cancelled') => {
        setLoadingId(id);
        const { error } = await supabase
            .from('exchanges')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            toast.error(`Failed to update status: ${error.message}`);
        } else {
            toast.success(`Exchange marked as ${newStatus}.`);
            
            const updatedExchange = exchanges.find(ex => ex.id === id);
            if (updatedExchange) {
                sendExchangeStatusUpdateWebhook({
                    exchange: updatedExchange,
                    newStatus: newStatus,
                    adminUsername: user?.email || 'An Admin'
                });
            }
        }
        setLoadingId(null);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this exchange? This action cannot be undone.')) {
            return;
        }
        setLoadingId(id);
        const { error } = await supabase
            .from('exchanges')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error(`Failed to delete exchange: ${error.message}`);
        } else {
            toast.success('Exchange record deleted successfully.');
        }
        setLoadingId(null);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Address copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const TableSkeleton = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Exchange</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                        <TableCell><div className="space-y-2"><Skeleton className="h-4 w-[100px]" /><Skeleton className="h-3 w-[150px]" /></div></TableCell>
                        <TableCell><div className="space-y-2"><Skeleton className="h-4 w-[80px]" /><Skeleton className="h-3 w-[100px]" /></div></TableCell>
                        <TableCell><div className="space-y-2"><Skeleton className="h-4 w-[70px]" /><Skeleton className="h-3 w-[120px]" /></div></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-8">
            <AdminPageHeader title="Orders" description="Approve or reject pending exchanges." />
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>All Exchanges</CardTitle>
                            <CardDescription>A log of all exchanges on the platform.</CardDescription>
                        </div>
                        <div className="w-full sm:w-64">
                            <FilterInput 
                                placeholder="Filter by user, email, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? <TableSkeleton /> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Exchange</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExchanges.map(ex => (
                                    <TableRow key={ex.id} className="hover:bg-muted/40">
                                        <TableCell className="text-sm text-muted-foreground">{format(new Date(ex.created_at), 'PPp')}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{ex.username || 'Anonymous'}</div>
                                            <div className="text-xs text-muted-foreground">{ex.email || ex.exchange_id}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{Number(ex.send_amount).toFixed(2)} {ex.from_currency}</div>
                                            <div className="text-xs text-muted-foreground">→ {Number(ex.receive_amount).toFixed(4)} {ex.to_currency}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{ex.payment_method_id ? paymentMethodMap[ex.payment_method_id] : ex.from_currency}</div>
                                            {ex.recipient_wallet_address && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="font-mono text-xs text-muted-foreground truncate cursor-pointer" style={{ maxWidth: '120px' }}>
                                                                    {ex.recipient_wallet_address}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>{ex.recipient_wallet_address}</p></TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => copyToClipboard(ex.recipient_wallet_address!, ex.id)}>
                                                        {copiedId === ex.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell><StatusBadge status={ex.status} /></TableCell>
                                        <TableCell className="text-right">
                                            {loadingId === ex.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-background/80 backdrop-blur-lg">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        {ex.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(ex.id, 'completed')}>
                                                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(ex.id, 'cancelled')} className="text-red-500">
                                                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDelete(ex.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
