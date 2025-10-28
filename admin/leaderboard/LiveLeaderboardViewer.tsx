import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';

type TopExchanger = {
  user_id: string;
  username: string;
  avatar_url: string;
  total_volume: number;
};

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

const RankIcon = ({ rank }: { rank: number }) => {
  const crownColor =
    rank === 1 ? 'text-yellow-400 fill-yellow-400/20' :
    rank === 2 ? 'text-gray-400 fill-gray-400/20' :
    rank === 3 ? 'text-orange-400 fill-orange-400/20' : 'text-muted-foreground';
  
  return (
    <div className="flex items-center justify-center w-12 text-lg font-bold">
      {rank <= 3 ? <Crown className={`h-8 w-8 ${crownColor}`} /> : <span className="text-muted-foreground">{rank}</span>}
    </div>
  );
};

export default function LiveLeaderboardViewer() {
    const [topExchangers, setTopExchangers] = useState<TopExchanger[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_top_users_by_volume');

            if (error) {
                console.error('Could not load top exchangers.', error);
                toast.error("Failed to load live leaderboard data.");
            } else {
                setTopExchangers(data as TopExchanger[]);
            }
            setLoading(false);
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Live Leaderboard</CardTitle>
                    <CardDescription>This is a live, read-only view of users with the highest exchange volume.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Live Leaderboard</CardTitle>
                <CardDescription>This is a live, read-only view of users with the highest exchange volume.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Total Volume</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topExchangers.length > 0 ? topExchangers.map((trader, index) => (
                            <TableRow key={trader.user_id}>
                                <TableCell><RankIcon rank={index + 1} /></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={trader.avatar_url || ''} />
                                            <AvatarFallback>{getInitials(trader.username)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-semibold">{trader.username}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono text-lg">${Number(trader.total_volume).toLocaleString()}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">No volume data available yet.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
