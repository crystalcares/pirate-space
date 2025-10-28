import { motion } from 'framer-motion';
import { Hourglass, RotateCw, Send, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedStatusIconProps {
  status: string;
}

const statusConfig = {
  pending: { icon: Hourglass, color: 'text-yellow-500', animation: { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }, transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } },
  confirming: { icon: RotateCw, color: 'text-blue-500', animation: { rotate: 360 }, transition: { duration: 1.5, repeat: Infinity, ease: 'linear' } },
  exchanging: { icon: RotateCw, color: 'text-purple-500', animation: { rotate: 360 }, transition: { duration: 1.2, repeat: Infinity, ease: 'linear' } },
  sending: { icon: Send, color: 'text-indigo-500', animation: { x: [0, 3, 0] }, transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' } },
  completed: { icon: CheckCircle, color: 'text-green-500', animation: { scale: [0.8, 1.1, 1] }, transition: { type: 'spring', stiffness: 400, damping: 15 } },
  cancelled: { icon: XCircle, color: 'text-red-500', animation: { scale: [0.8, 1.1, 1], rotate: [0, -10, 10, 0] }, transition: { duration: 0.5 } },
};

export default function AnimatedStatusIcon({ status }: AnimatedStatusIconProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || { icon: Hourglass, color: 'text-muted-foreground', animation: {}, transition: {} };
  const Icon = config.icon;

  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <motion.div
        animate={config.animation}
        transition={config.transition as any}
        className={cn(config.color)}
      >
        <Icon className="h-5 w-5" />
      </motion.div>
    </div>
  );
}
