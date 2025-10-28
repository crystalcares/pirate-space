import { useMemo } from 'react';
import {
  Button,
} from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "react-router-dom"
import { Tables } from "@/lib/database.types"
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

type Exchange = Tables<'exchanges'>;

interface UserDashboardProps {
  exchanges: Exchange[];
}

const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles: { [key: string]: string } = {
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return <Badge variant="outline" className={`capitalize ${statusStyles[status] || 'bg-muted'}`}>{status}</Badge>;
};

export default function UserDashboard({ exchanges }: UserDashboardProps) {
    const totalExchanges = exchanges.length;
    const completedExchanges = useMemo(() => exchanges.filter(ex => ex.status === 'completed').length, [exchanges]);
    const pendingExchanges = useMemo(() => exchanges.filter(ex => ex.status === 'pending').length, [exchanges]);
    
    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Exchanges</CardDescription>
                        <CardTitle className="text-4xl">{totalExchanges}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            All exchanges you have initiated.
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Completed</CardDescription>
                        <CardTitle className="text-4xl">{completedExchanges}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Successfully completed exchanges.
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pending</CardDescription>
                        <CardTitle className="text-4xl">{pendingExchanges}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Exchanges awaiting processing.
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Recent Exchanges</CardTitle>
                        <CardDescription>
                            Your 5 most recent exchanges.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead><span className="sr-only">View</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {exchanges.slice(0, 5).map(ex => (
                            <TableRow key={ex.id}>
                                <TableCell className="font-mono text-xs">{ex.exchange_id}</TableCell>
                                <TableCell>{format(new Date(ex.created_at), 'PP')}</TableCell>
                                <TableCell><StatusBadge status={ex.status} /></TableCell>
                                <TableCell className="text-right">{ex.send_amount.toFixed(2)} {ex.from_currency}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild size="sm" variant="outline">
                                        <Link to={`/track/${ex.id}`}>View</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
