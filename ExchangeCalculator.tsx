import { useState, useMemo, useEffect, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { TablesInsert } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { useExchangeConfig } from '@/hooks/useExchangeConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import BuySellPanel from './sections/BuySellPanel';
import { useAppConfig } from '@/contexts/AppConfigContext';
import CryptoExchangePanel from './sections/CryptoExchangePanel';

const TrustpilotWidget = () => {
    const config = useAppConfig();
    const rating = parseFloat(config?.trustpilot_rating || '4.5');
    const reviewsCount = config?.trustpilot_reviews_count || '12,887';
    const iconUrl = config?.trustpilot_icon_url || 'https://img.icons8.com/color/48/trustpilot.png';
    const brandName = config?.trustpilot_brand_name || 'Trustpilot';

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <img src={iconUrl} alt="Trustpilot" className="h-5 w-5" />
            <p className="text-sm font-semibold text-foreground">{brandName}</p>
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 transition-colors ${i < Math.floor(rating) ? 'text-green-500 fill-green-500' : 'text-muted-foreground/30'}`} />)}
            </div>
            <p className="text-sm text-muted-foreground">{rating.toFixed(1)} | {reviewsCount} reviews</p>
        </div>
    );
};

export default function ExchangeCalculator({ initialTab = 'exchange' }: { initialTab?: 'exchange' | 'buy-sell' }) {
  const { loading: configLoading } = useExchangeConfig();

  if (configLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-2xl bg-card/80 backdrop-blur-xl border-border/20 rounded-2xl">
      <CardContent className="p-2">
        <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent p-1 rounded-xl">
                <TabsTrigger value="exchange" className="rounded-lg data-[state=active]:bg-muted/80 data-[state=active]:text-foreground data-[state=active]:shadow-lg">Exchange Crypto</TabsTrigger>
                <TabsTrigger value="buy-sell" className="rounded-lg data-[state=active]:bg-muted/80 data-[state=active]:text-foreground data-[state=active]:shadow-lg flex items-center gap-2">
                    Buy / Sell Crypto
                </TabsTrigger>
            </TabsList>
            <TabsContent value="exchange" className="mt-4 px-4 pb-4">
                <CryptoExchangePanel />
                <TrustpilotWidget />
            </TabsContent>
            <TabsContent value="buy-sell" className="mt-4 px-4 pb-4">
                <BuySellPanel />
                <TrustpilotWidget />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
