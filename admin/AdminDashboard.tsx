import {
  DollarSign,
  Users2,
  ArrowRightLeft,
  Activity,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts"
import { useMemo, useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { motion } from "framer-motion"
import AdminPageHeader from "./ui/AdminPageHeader"
import DashboardStatCard from "./ui/DashboardStatCard"
import { Skeleton } from "../ui/skeleton"
import { toast } from "sonner"
import LiveFeedPanel from "./live-feed/LiveFeedPanel"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (stats === null) {
                setLoading(true);
            }
            const { data, error } = await supabase.rpc('get_dashboard_stats');
    
            if (error) {
                console.error("Admin Dashboard fetch error:", error);
            } else {
                setStats(data);
            }
            setLoading(false);
        };
    
        fetchData();
    
        const channel = supabase
          .channel('admin-dashboard-stats-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'exchanges' },
            (payload) => {
              console.log('Exchange change detected, refetching dashboard stats.', payload);
              toast.info('Dashboard stats are updating...');
              fetchData();
            }
          )
          .subscribe();
    
        return () => {
          supabase.removeChannel(channel);
        };
    }, []);

    const revenueChange = useMemo(() => calculatePercentageChange(stats?.revenue_this_month || 0, stats?.revenue_last_month || 0), [stats]);
    const usersChange = useMemo(() => calculatePercentageChange(stats?.users_this_month || 0, stats?.users_last_month || 0), [stats]);

    const pieData = useMemo(() => [
        { name: 'Pending', value: stats?.pending_exchanges || 0, color: 'hsl(var(--primary))' },
        { name: 'Completed', value: stats?.completed_exchanges || 0, color: 'hsl(var(--accent-foreground))' },
        { name: 'Cancelled', value: stats?.cancelled_exchanges || 0, color: 'hsl(var(--destructive))' },
    ], [stats]);

    return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Dashboard" description="A real-time overview of your exchange's performance." />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <motion.div 
                className="grid gap-4 md:grid-cols-2 md:gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <DashboardStatCard 
                        loading={loading}
                        title="Total Revenue"
                        value={`$${(stats?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        description="from last month"
                        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                        change={revenueChange}
                        changeType={revenueChange > 0 ? 'increase' : revenueChange < 0 ? 'decrease' : 'neutral'}
                        data={stats?.monthly_revenue?.map((m: any) => ({ value: m.total })) || []}
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <DashboardStatCard 
                        loading={loading}
                        title="Total Exchanges"
                        value={`+${(stats?.total_exchanges || 0).toLocaleString()}`}
                        description="all time"
                        icon={<ArrowRightLeft className="h-4 w-4 text-muted-foreground" />}
                        change={0}
                        changeType="neutral"
                        data={stats?.monthly_revenue?.map((m: any) => ({ value: m.total })) || []} // Placeholder data
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <DashboardStatCard 
                        loading={loading}
                        title="Total Customers"
                        value={`+${(stats?.total_users || 0).toLocaleString()}`}
                        description="from last month"
                        icon={<Users2 className="h-4 w-4 text-muted-foreground" />}
                        change={usersChange}
                        changeType={usersChange > 0 ? 'increase' : usersChange < 0 ? 'decrease' : 'neutral'}
                        data={stats?.monthly_revenue?.map((m: any) => ({ value: m.total })) || []} // Placeholder data
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <DashboardStatCard 
                        loading={loading}
                        title="Pending Exchanges"
                        value={`+${(stats?.pending_exchanges || 0).toLocaleString()}`}
                        description="awaiting approval"
                        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                        change={0}
                        changeType="neutral"
                        data={stats?.monthly_revenue?.map((m: any) => ({ value: m.total })) || []} // Placeholder data
                    />
                </motion.div>
            </motion.div>
            <motion.div 
                className="grid gap-4 md:gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    {loading ? <Skeleton className="w-full h-[350px]" /> : (
                        <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={stats?.monthly_revenue}>
                            <defs>
                            <linearGradient id="totalRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            />
                            <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                            />
                            <RechartsTooltip 
                                cursor={{fill: 'hsl(var(--accent))'}}
                                contentStyle={{backgroundColor: 'hsl(var(--background) / 0.8)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: 'var(--radius)', backdropFilter: 'blur(4px)'}}
                            />
                            <Bar dataKey="total" fill="url(#totalRevenueGradient)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
                </Card>
            </motion.div>
        </div>
        <div className="lg:col-span-1">
            <LiveFeedPanel />
        </div>
      </div>
    </div>
  )
}
