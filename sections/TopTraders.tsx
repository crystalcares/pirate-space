import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, ArrowRight } from 'lucide-react';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { Tables } from '@/lib/database.types';

type CuratedTrader = Tables<'top_traders'>;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const SkeletonTrader = () => (
    <Card className="p-4">
        <CardContent className="p-0 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
            <div className="w-full space-y-2">
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
            </div>
        </CardContent>
    </Card>
);

export default function TopTraders() {
  const [traders, setTraders] = useState<CuratedTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const config = useAppConfig();

  useEffect(() => {
    const fetchTopTraders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('top_traders')
            .select('*')
            .order('order')
            .limit(6);

        if (error) {
            console.error('Could not load the Hall of Captains.', error);
        } else {
            setTraders(data);
        }
        setLoading(false);
    };
    fetchTopTraders();
  }, []);

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <section id="top-traders" className="py-12 sm:py-24">
      <motion.div
        className="mx-auto max-w-xl text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display">{config?.top_traders_title || 'Hall of Captains'}</h2>
        <p className="mt-4 text-lg text-foreground/80">
          {config?.top_traders_subtitle || 'Meet the most legendary traders navigating the digital cosmos with us.'}
        </p>
      </motion.div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: 6}).map((_, i) => <SkeletonTrader key={i} />)}
        </div>
      ) : traders.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {traders.map((trader) => (
            <motion.div key={trader.id} variants={itemVariants}>
              <Card className="p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10 hover:-translate-y-1">
                <CardContent className="p-0 flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-primary/30">
                      <AvatarImage src={trader.avatar_url || ''} alt={trader.name} />
                      <AvatarFallback>{getInitials(trader.name)}</AvatarFallback>
                    </Avatar>
                    {trader.order === 1 && (
                      <Crown className="absolute -top-3 -right-3 h-6 w-6 text-primary fill-primary rotate-12" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-lg">{trader.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${trader.volume.toLocaleString()} Traded
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center text-muted-foreground py-8">The Hall of Captains is currently empty.</div>
      )}
      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
      >
        <Button asChild size="lg" variant="outline">
            <Link to="/leaderboard">
                View Full Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </motion.div>
    </section>
  );
}
