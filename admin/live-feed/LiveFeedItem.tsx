import { motion } from 'framer-motion';
import { AdminExchangeData } from '../TransactionManagement';
import { CurrencyIcon } from '@/lib/currency-icons';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedStatusIcon from './AnimatedStatusIcon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LiveFeedItemProps {
    exchange: AdminExchangeData;
}

const statusColors = {
    pending: 'border-yellow-500/50',
    confirming: 'border-blue-500/50',
    exchanging: 'border-purple-500/50',
    sending: 'border-indigo-500/50',
    completed: 'border-green-500/50',
    cancelled: 'border-red-500/50',
};

export default function LiveFeedItem({ exchange }: LiveFeedItemProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
                "p-3 rounded-lg bg-muted/50 border-l-4",
                statusColors[exchange.status as keyof typeof statusColors] || 'border-muted'
            )}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <AnimatedStatusIcon status={exchange.status} />
                    <div>
                        <div className="flex items-center gap-2 font-semibold">
                            <CurrencyIcon symbol={exchange.from_currency} className="h-4 w-4" />
                            <span>{exchange.send_amount.toFixed(2)} {exchange.from_currency}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <CurrencyIcon symbol={exchange.to_currency} className="h-4 w-4" />
                            <span>{exchange.receive_amount.toFixed(4)} {exchange.to_currency}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{exchange.username || 'Anonymous'}</span>
                        </div>
                    </div>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatDistanceToNow(new Date(exchange.created_at), { addSuffix: true })}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{new Date(exchange.created_at).toLocaleString()}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </motion.div>
    );
}
