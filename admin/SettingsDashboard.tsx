import { Link } from 'react-router-dom';
import { Settings, Palette, Coins, Repeat, DollarSign, Bell } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsDashboard = () => {
    const settingsNavItems = [
        { to: '/admin/settings/general', label: 'General', icon: Settings, description: 'Site-wide settings' },
        { to: '/admin/settings/currencies', label: 'Currencies', icon: Coins, description: 'Manage currencies' },
        { to: '/admin/settings/exchange-pairs', label: 'Exchange Pairs', icon: Repeat, description: 'Fees and pairs' },
        { to: '/admin/settings/payment-methods', label: 'Payment Methods', icon: DollarSign, description: 'Recipient details' },
        { to: '/admin/settings/notifications', label: 'Notifications', icon: Bell, description: 'Sound and alerts' },
    ];

    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {settingsNavItems.map(item => (
                    <Link to={item.to} key={item.to}>
                        <Card className="sm:col-span-1 cursor-pointer hover:bg-muted/50 transition-colors h-full">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-2xl flex items-center gap-3"><item.icon className="w-6 h-6" /> {item.label}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SettingsDashboard;
