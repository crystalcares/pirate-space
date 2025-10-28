import { cn } from "@/lib/utils";
import { Card } from "./card";
import { motion } from "framer-motion";

interface FuturisticCardProps {
    children: React.ReactNode;
    className?: string;
    glowClassName?: string;
}

export function FuturisticCard({ children, className, glowClassName }: FuturisticCardProps) {
    return (
        <motion.div 
            className={cn("relative p-px overflow-hidden rounded-2xl group", className)}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
        >
            <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-300",
                glowClassName
            )} />
            <Card className="relative bg-card/80 backdrop-blur-xl h-full w-full border-border/50">
                {children}
            </Card>
        </motion.div>
    );
}
