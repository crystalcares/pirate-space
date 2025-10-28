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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

type Exchange = Tables<'exchanges'>;

interface UserExchangesProps {
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

export default function UserExchanges({ exchanges }: UserExchangesProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle>My Exchanges</CardTitle>
            <CardDescription>A complete history of all your exchanges.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead><span className="sr-only">View</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {exchanges.map(ex => (
                    <TableRow key={ex.id}>
                        <TableCell className="font-mono text-xs">{ex.exchange_id}</TableCell>
                        <TableCell>{format(new Date(ex.created_at), 'PPp')}</TableCell>
                        <TableCell>{ex.send_amount.toFixed(2)} {ex.from_currency}</TableCell>
                        <TableCell>{ex.receive_amount.toFixed(2)} {ex.to_currency}</TableCell>
                        <TableCell><StatusBadge status={ex.status} /></TableCell>
                        <TableCell className="text-right">
                            <Button asChild size="sm" variant="outline">
                                <Link to={`/track/${ex.id}`}>View Details</Link>
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
