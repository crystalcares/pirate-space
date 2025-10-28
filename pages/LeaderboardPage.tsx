import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tables } from '@/lib/database.types';
import { useAppConfig } from '@/contexts/AppConfigContext';

type LiveExchanger = {
  user_id: string;
  username: string;
  avatar_url: string;
  total_volume: number;
};

type CuratedExchanger = Tables<'top_traders'>;

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

const ExchangerRow = ({ rank, avatar, name, title, volume }: { rank: number, avatar: string, name: string, title: string, volume: number }) => (
    <motion.div 
        className="flex items-center p-3 rounded-lg bg-background/50 hover:bg-muted/50 transition-colors"
        variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
    >
        <RankIcon rank={rank} />
        <div className="flex items-center gap-4 flex-1 ml-4">
            <Avatar className="h-12 w-12"><AvatarImage src={avatar || ''} /><AvatarFallback>{getInitials(name)}</AvatarFallback></Avatar>
            <div><p className="font-semibold">{name}</p><p className="text-sm text-muted-foreground">{title}</p></div>
        </div>
        <div className="text-right"><p className="font-bold text-lg text-primary">${Number(volume).toLocaleString()}</p><p className="text-sm text-muted-foreground">Total Exchanged</p></div>
    </motion.div>
);

export default function LeaderboardPage() {
    const [liveExchangers, setLiveExchangers] = useState<LiveExchanger[]>([]);
    const [curatedExchangers, setCuratedExchangers] = useState<CuratedExchanger[]>([]);
    const [loading, setLoading] = useState(true);
    const config = useAppConfig();

    useEffect(() => {
        const fetchLeaderboards = async () => {
            setLoading(true);
            const [liveRes, curatedRes] = await Promise.all([
                supabase.rpc('get_top_users_by_volume'),
                supabase.from('top_traders').select('*').order('order')
            ]);

            if (liveRes.error) {
                console.error('Could not load top exchangers.', liveRes.error);
            } else {
                setLiveExchangers(liveRes.data as LiveExchanger[]);
            }

            if (curatedRes.error) {
                console.error('Could not load curated exchangers.', curatedRes.error);
            } else {
                setCuratedExchangers(curatedRes.data as CuratedExchanger[]);
            }

            setLoading(false);
        };
        fetchLeaderboards();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    return (
        <>
            <Header />
            <main className="container py-12 sm:py-20">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl sm:text-5xl font-bold font-display">Leaderboard</h1>
                    <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
                        See who's making waves in the digital seas.
                    </p>
                </motion.div>

                <Tabs defaultValue="live" className="max-w-4xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="live">{config?.leaderboard_tab1_title || 'Live Leaderboard'}</TabsTrigger>
                        <TabsTrigger value="curated">{config?.leaderboard_tab2_title || 'Curated Exchangers'}</TabsTrigger>
                    </TabsList>
                    <Card className="bg-card/50 backdrop-blur-xl border-border/50">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                <TabsContent value="live">
                                    <CardHeader>
                                        <CardTitle>{config?.leaderboard_tab1_title || 'Live Leaderboard'}</CardTitle>
                                        <CardDescription>Top users by total exchange volume (updated live).</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
                                            {liveExchangers.length > 0 ? liveExchangers.map((trader, index) => (
                                                <ExchangerRow 
                                                    key={trader.user_id}
                                                    rank={index + 1}
                                                    avatar={trader.avatar_url || ''}
                                                    name={trader.username}
                                                    title="Verified User"
                                                    volume={trader.total_volume}
                                                />
                                            )) : <p className="text-muted-foreground text-center py-8">The leaderboard is currently being updated.</p>}
                                        </motion.div>
                                    </CardContent>
                                </TabsContent>
                                <TabsContent value="curated">
                                    <CardHeader>
                                        <CardTitle>{config?.leaderboard_tab2_title || 'Curated Exchangers'}</CardTitle>
                                        <CardDescription>A curated list of our most valued partners and exchangers.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
                                            {curatedExchangers.length > 0 ? curatedExchangers.map((trader, index) => (
                                                <ExchangerRow 
                                                    key={trader.id}
                                                    rank={index + 1}
                                                    avatar={trader.avatar_url || ''}
                                                    name={trader.name}
                                                    title={trader.title}
                                                    volume={trader.volume}
                                                />
                                            )) : <p className="text-muted-foreground text-center py-8">Our curated list is currently being updated.</p>}
                                        </motion.div>
                                    </CardContent>
                                </TabsContent>
                            </>
                        )}
                    </Card>
                </Tabs>
            </main>
            <Footer />
        </>
    );
}
