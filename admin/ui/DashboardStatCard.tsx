import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface DashboardStatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    data: { value: number }[];
    loading: boolean;
}

const ChangeIcon = ({ type }: { type: DashboardStatCardProps['changeType'] }) => {
    if (type === 'increase') return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (type === 'decrease') return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export default function DashboardStatCard({ title, value, description, icon, change, changeType, data, loading }: DashboardStatCardProps) {
    if (loading) {
        return (
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="glass-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ChangeIcon type={changeType} />
                    <span>{change.toFixed(2)}%</span>
                    <span>{description}</span>
                </div>
                <div className="h-16 -mx-6 -mb-6 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`gradient-${changeType}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={cn(
                                        changeType === 'increase' && 'hsl(var(--primary))',
                                        changeType === 'decrease' && 'hsl(var(--destructive))',
                                        changeType === 'neutral' && 'hsl(var(--muted-foreground))'
                                    )} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={cn(
                                        changeType === 'increase' && 'hsl(var(--primary))',
                                        changeType === 'decrease' && 'hsl(var(--destructive))',
                                        changeType === 'neutral' && 'hsl(var(--muted-foreground))'
                                    )} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={cn(
                                    changeType === 'increase' && 'hsl(var(--primary))',
                                    changeType === 'decrease' && 'hsl(var(--destructive))',
                                    changeType === 'neutral' && 'hsl(var(--muted-foreground))'
                                )}
                                strokeWidth={2}
                                fill={`url(#gradient-${changeType})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
