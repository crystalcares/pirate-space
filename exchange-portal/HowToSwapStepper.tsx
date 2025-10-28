import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
    { id: 1, label: 'Choose currencies' },
    { id: 2, label: 'Enter the address' },
    { id: 3, label: 'Create an exchange' },
];

interface HowToSwapStepperProps {
    currentStep: number;
}

export default function HowToSwapStepper({ currentStep }: HowToSwapStepperProps) {
    return (
        <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-4 text-foreground">How to swap:</h3>
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : isCurrent ? (
                                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{step.id}</div>
                                ) : (
                                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">{step.id}</div>
                                )}
                            </div>
                            <span className={cn(
                                "text-sm",
                                isCompleted ? "text-foreground line-through" : isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
