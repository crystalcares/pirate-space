import { Lock } from 'lucide-react';

export default function AntiPhishingCheck() {
    return (
        <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2 text-foreground">Anti-phishing check</h3>
            <p className="text-sm text-muted-foreground mb-3">Make sure you're on:</p>
            <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/20">
                <Lock className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-400">https://pirate.exchange</span>
            </div>
        </div>
    );
}
