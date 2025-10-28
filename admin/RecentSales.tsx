import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { AdminExchangeData } from "./AdminDashboard";

interface RecentSalesProps {
    exchanges: AdminExchangeData[];
}

export function RecentSales({ exchanges }: RecentSalesProps) {
    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

  return (
    <div className="space-y-8">
        {exchanges.slice(0, 5).map(exchange => (
            <div key={exchange.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={exchange.avatar_url || ''} alt={exchange.username || 'Avatar'} />
                    <AvatarFallback>{getInitials(exchange.username)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{exchange.username || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">{exchange.email || exchange.exchange_id}</p>
                </div>
                <div className="ml-auto font-medium">+${exchange.send_amount.toFixed(2)}</div>
            </div>
        ))}
    </div>
  )
}
