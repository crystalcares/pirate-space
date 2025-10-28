import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Twitter } from 'lucide-react';
import { PirateLogo } from '../ui/logo-icon';
import { HashLink } from 'react-router-hash-link';
import { useAppConfig } from '@/contexts/AppConfigContext';

export default function Footer() {
  const config = useAppConfig();

  const socialLinks = [
    { icon: Twitter, href: config?.footer_social_twitter_url || '#', label: 'X / Twitter' },
    { icon: Send, href: config?.footer_social_telegram_url || '#', label: 'Telegram' },
  ];

  const copyrightText = config?.footer_copyright_text || '© 2025 Pirate Exchange — All Rights Reserved.';

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="border-t mt-16"
    >
      <div className="container mx-auto py-12 px-4">
        <div className="grid md:grid-cols-3 gap-8 text-muted-foreground">
            <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-3 mb-4">
                    <PirateLogo />
                </div>
                <p className="text-sm text-center md:text-left">The future of digital asset exchange.</p>
            </div>
            <div className="flex flex-col items-center">
                <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
                <div className="flex flex-col gap-2 items-center">
                    <Link to="/exchange" className="text-sm hover:text-primary transition-colors">Exchange</Link>
                    <Link to="/about" className="text-sm hover:text-primary transition-colors">About</Link>
                    <Link to="/leaderboard" className="text-sm hover:text-primary transition-colors">Leaderboard</Link>
                </div>
            </div>
            <div className="flex flex-col items-center md:items-end">
                <h4 className="font-semibold text-foreground mb-4">Legal & Social</h4>
                <div className="flex flex-col gap-2 items-center md:items-end">
                    <Link to="/terms" className="text-sm hover:text-primary transition-colors">Terms of Service</Link>
                    <Link to="/privacy" className="text-sm hover:text-primary transition-colors">Privacy Policy</Link>
                    <div className="flex items-center gap-4 mt-4">
                        {socialLinks.map(link => (
                            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <link.icon className="h-5 w-5" />
                                <span className="sr-only">{link.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>{copyrightText}</p>
        </div>
      </div>
    </motion.footer>
  );
}
