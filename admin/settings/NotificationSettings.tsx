import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationSettings() {
    const { isSoundEnabled, toggleSound } = useNotifications();

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive alerts and notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="sound-switch" className="text-base">
                            Notification Sounds
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Enable or disable sound effects for real-time events.
                        </p>
                    </div>
                    <Switch
                        id="sound-switch"
                        checked={isSoundEnabled}
                        onCheckedChange={toggleSound}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
