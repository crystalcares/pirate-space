import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, Hourglass, RotateCw } from "lucide-react";
import { useMemo } from "react";

export type ExchangeStatus = "pending" | "confirming" | "exchanging" | "sending" | "completed" | "cancelled";

const steps = [
    { name: "Exchange Created", icon: Hourglass },
    { name: "Payment Detected", icon: RotateCw },
    { name: "Confirming", icon: Loader2 },
    { name: "Completed", icon: CheckCircle },
];

const statusMap: { [key: string]: number } = {
    pending: 0,
    confirming: 2,
    exchanging: 2, // Map exchanging to confirming step visually
    sending: 3,
    completed: 3,
    cancelled: -1,
};

const REQUIRED_CONFIRMATIONS = 3;

interface TrackingProgressStepperProps {
    currentStatus: string;
    confirmations: number | null;
}

const AnimatedIcon = ({ icon: Icon, isActive, isCompleted, isProcessing }: { icon: React.ElementType, isActive: boolean, isCompleted: boolean, isProcessing: boolean }) => {
    if (isProcessing) {
        return <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}><Icon className="h-5 w-5" /></motion.div>;
    }
    if (isActive && Icon === Hourglass) {
        return <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}><Icon className="h-5 w-5" /></motion.div>;
    }
    if (isCompleted) {
        return <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}><CheckCircle className="h-5 w-5" /></motion.div>;
    }
    return <Icon className="h-5 w-5" />;
};

export default function TrackingProgressStepper({ currentStatus, confirmations }: TrackingProgressStepperProps) {
    const activeIndex = useMemo(() => {
        const baseIndex = statusMap[currentStatus] ?? 0;
        // If status is 'confirming', but no payment is detected yet, we are at step 1.
        if (currentStatus === 'confirming' && confirmations === null) return 1;
        return baseIndex;
    }, [currentStatus, confirmations]);

    if (currentStatus === 'cancelled') {
        return (
            <div className="text-center text-destructive py-4">
                This exchange has been cancelled.
            </div>
        );
    }

    const getStepName = (stepName: string, index: number) => {
        if (index === 2 && activeIndex === 2 && confirmations !== null) {
            return `Confirming (${confirmations}/${REQUIRED_CONFIRMATIONS})`;
        }
        return stepName;
    }

    return (
        <div className="relative w-full py-4">
            <div className="absolute top-6 left-0 w-full h-0.5 bg-muted -translate-y-1/2" />
            <motion.div 
                className="absolute top-6 left-0 h-0.5 bg-primary -translate-y-1/2"
                initial={{ width: 0 }}
                animate={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const isActive = index === activeIndex;
                    const isCompleted = index < activeIndex;
                    const isProcessing = isActive && ["Confirming"].includes(step.name);

                    return (
                        <div key={step.name} className="flex flex-col items-center gap-2 text-center w-24">
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                isActive ? "bg-primary border-primary text-primary-foreground" :
                                "bg-muted border-border text-muted-foreground"
                            )}>
                                <AnimatedIcon icon={step.icon} isActive={isActive} isCompleted={isCompleted} isProcessing={isProcessing} />
                            </div>
                            <p className={cn(
                                "text-xs font-medium transition-colors",
                                isCompleted || isActive ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {getStepName(step.name, index)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
