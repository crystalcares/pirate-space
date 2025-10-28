import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { Tables } from '@/lib/database.types';

import UserDashboardLayout from '@/components/layout/UserDashboardLayout';
import UserDashboard from '@/components/user/UserDashboard';
import UserExchanges from '@/components/user/UserExchanges';
import UserSettings from '@/components/user/UserSettings';

type Exchange = Tables<'exchanges'>;

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase.rpc('get_user_exchanges');

    if (error) {
      console.error(`Failed to fetch your exchanges:`, error);
    } else {
      setExchanges((data as Exchange[]) || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const renderWithLoader = (component: React.ReactNode) => {
    if (loading) {
      return <div className="flex items-center justify-center h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    return component;
  }

  return (
    <UserDashboardLayout>
      <Routes>
        <Route path="overview" element={renderWithLoader(<UserDashboard exchanges={exchanges} />)} />
        <Route path="exchanges" element={renderWithLoader(<UserExchanges exchanges={exchanges} />)} />
        <Route path="settings" element={renderWithLoader(<UserSettings onProfileUpdate={fetchData} />)} />
        <Route path="/" element={<Navigate to="overview" replace />} />
      </Routes>
    </UserDashboardLayout>
  );
}
