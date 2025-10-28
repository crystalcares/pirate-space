import { Routes, Route, Link } from 'react-router-dom';
import { Package, MessageSquare, HelpCircle, Book, Newspaper, Info, Users2, AreaChart, GalleryVerticalEnd, Bell } from 'lucide-react';

import AdminLayout from '@/components/layout/AdminLayout';
import GeneralSettings from '@/components/admin/GeneralSettings';
import UserManagement from '@/components/admin/UserManagement';
import AdminDashboard from '@/components/admin/AdminDashboard';
import PaymentSettings from '@/components/admin/PaymentSettings';
import TransactionManagement from '@/components/admin/TransactionManagement';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LandingPageEditor from '@/components/admin/LandingPageEditor';
import FeaturesManager from '@/components/admin/content/FeaturesManager';
import HowItWorksManager from '@/components/admin/content/HowItWorksManager';
import FaqManager from '@/components/admin/content/FaqManager';
import TestimonialsManager from '@/components/admin/content/TestimonialsManager';
import ExchangePairsManager from '@/components/admin/settings/ExchangePairsManager';
import AboutUsManager from '@/components/admin/content/AboutUsManager';
import LeadershipManager from '@/components/admin/content/LeadershipManager';
import ThemeEditor from '@/components/admin/ThemeEditor';
import SettingsDashboard from '@/components/admin/SettingsDashboard';
import CurrencyManager from '@/components/admin/settings/CurrencyManager';
import AdminLeaderboardPage from './admin/AdminLeaderboardPage';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import NotificationSettings from '@/components/admin/settings/NotificationSettings';

const ContentDashboard = () => {
    const contentNavItems = [
        { to: '/admin/content/landing-page', label: 'Landing Page', icon: Newspaper, description: "Headlines and sections" },
        { to: '/admin/content/features', label: 'Features', icon: Package, description: "Promotional points" },
        { to: '/admin/content/testimonials', label: 'Testimonials', icon: MessageSquare, description: "User reviews" },
        { to: '/admin/content/how-it-works', label: 'How It Works', icon: HelpCircle, description: "Step-by-step guide" },
        { to: '/admin/content/faq', label: 'FAQ', icon: Book, description: "Questions and answers" },
        { to: '/admin/content/about-us', label: 'About Us Page', icon: Info, description: "Company story" },
        { to: '/admin/content/leadership', label: 'Leadership Team', icon: Users2, description: "Team member profiles" },
    ];

    return (
        <div className="space-y-8">
            <AdminPageHeader title="Content Management" description="Manage all text and media content across the website." />
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {contentNavItems.map(item => (
                     <Link to={item.to} key={item.to}>
                        <Card className="sm:col-span-1 cursor-pointer hover:bg-muted/50 transition-colors h-full bg-card/60 backdrop-blur-lg border-border/20">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl flex items-center gap-3"><item.icon className="w-5 h-5 text-primary" /> {item.label}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                        </Card>
                     </Link>
                ))}
                </div>
            </div>
        </div>
    );
};

export default function AdminPage() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<TransactionManagement />} />
        <Route path="customers" element={<UserManagement />} />
        <Route path="leaderboard" element={<AdminLeaderboardPage />} />
        
        <Route path="settings" element={<SettingsDashboard />} />
        <Route path="settings/general" element={<GeneralSettings />} />
        <Route path="settings/currencies" element={<CurrencyManager />} />
        <Route path="settings/exchange-pairs" element={<ExchangePairsManager />} />
        <Route path="settings/payment-methods" element={<PaymentSettings />} />
        <Route path="settings/notifications" element={<NotificationSettings />} />

        <Route path="content" element={<ContentDashboard />} />
        <Route path="content/landing-page" element={<LandingPageEditor />} />
        <Route path="content/features" element={<FeaturesManager />} />
        <Route path="content/how-it-works" element={<HowItWorksManager />} />
        <Route path="content/faq" element={<FaqManager />} />
        <Route path="content/testimonials" element={<TestimonialsManager />} />
        <Route path="content/about-us" element={<AboutUsManager />} />
        <Route path="content/leadership" element={<LeadershipManager />} />
        
        <Route path="appearance" element={<ThemeEditor />} />
      </Routes>
    </AdminLayout>
  );
}
