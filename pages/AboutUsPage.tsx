import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { Loader2, Crown, Trophy, Linkedin, Twitter, Dribbble } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Tables } from '@/lib/database.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type LeadershipMember = Tables<'leadership_team'>;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const MountainSVG = () => (
    <svg className="absolute bottom-0 left-0 w-full h-auto" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <motion.path
            initial={{ d: "M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,176C672,171,768,117,864,101.3C960,85,1056,107,1152,133.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
            animate={{ d: "M0,256L48,240C96,224,192,192,288,197.3C384,203,480,245,576,240C672,235,768,181,864,165.3C960,149,1056,171,1152,197.3C1248,224,1344,256,1392,272L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
        />
    </svg>
);

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

const LeadershipRow = ({ member, rank }: { member: LeadershipMember; rank: number }) => {
    const socialLinks = [
        { url: member.linkedin_url, icon: Linkedin, name: 'LinkedIn' },
        { url: member.twitter_url, icon: Twitter, name: 'Twitter' },
        { url: member.dribbble_url, icon: Dribbble, name: 'Dribbble' },
    ].filter(link => link.url);

    const crownColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-orange-400' : 'text-muted-foreground';

    return (
        <motion.div variants={itemVariants}>
            <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-all duration-300">
                <div className="p-4 grid grid-cols-[auto_1fr_auto_auto] items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Crown className={`h-6 w-6 ${crownColor}`} />
                        <Avatar className="h-12 w-12 border-2 border-muted">
                            <AvatarImage src={member.avatar_url || ''} alt={member.name} />
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {socialLinks.map(social => (
                            <Button asChild key={social.name} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <a href={social.url!} target="_blank" rel="noopener noreferrer">
                                    <social.icon className="h-4 w-4" />
                                </a>
                            </Button>
                        ))}
                    </div>
                    {member.metric_value && (
                        <div className="text-right">
                            <p className="font-bold text-lg text-primary flex items-center justify-end gap-2">
                                <Trophy className="h-5 w-5" />
                                {member.metric_value}
                            </p>
                            <p className="text-xs text-muted-foreground">{member.metric_label || 'Total Exchanged'}</p>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
};

export default function AboutUsPage() {
  const config = useAppConfig();
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeadership = async () => {
      const { data, error } = await supabase
        .from('leadership_team')
        .select('*')
        .order('order');
      
      if (error) {
        console.error('Could not load leadership team.', error);
      } else {
        setLeadership(data);
      }
      setLoading(false);
    };

    fetchLeadership();
  }, []);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        <motion.section
          className="relative py-20 sm:py-32 text-center bg-card/50 overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-card/80 via-card/50 to-transparent -z-10"></div>
          <div className="container relative z-10">
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl font-bold font-display">
              {config.about_us_hero_title || 'We Are Pirate Exchange'}
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto">
              {config.about_us_hero_subtitle || 'Providing you with the most actionable exchange data.'}
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 text-base text-left text-foreground/70 max-w-2xl mx-auto space-y-4">
                <p>{config.about_us_hero_paragraph1 || "Publishers need to know what apps to build, how to monetize them, and where to price them. Advertisers and brands need to identify their target users, and determine where to allocate resources in order to reach them most effectively."}</p>
                <p>{config.about_us_hero_paragraph2 || "In business, we need data to make informed decisions. Pirate Exchange provides the most actionable insights in the industry. We aim to make this data available to as many people as possible."}</p>
            </motion.div>
          </div>
          <MountainSVG />
        </motion.section>

        <section className="py-12 sm:py-24">
          <div className="container max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={itemVariants}
            >
              <h2 className="text-3xl sm:text-4xl font-bold font-display">{config.about_us_leadership_title || 'Meet Our Leadership'}</h2>
            </motion.div>
            
            {loading ? (
                <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
                <motion.div
                    className="space-y-4"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={containerVariants}
                >
                    {leadership.map((member, index) => (
                        <LeadershipRow key={member.id} member={member} rank={index + 1} />
                    ))}
                </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
