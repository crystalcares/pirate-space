import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import UserNav from './UserNav';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { PirateLogo } from '../ui/logo-icon';
import { ThemeToggle } from '../ui/theme-toggle';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { name: 'Leaderboard', href: '/leaderboard', type: 'link' },
    { name: 'About', href: '/about', type: 'link' },
    { name: 'FAQ', href: '/#faq', type: 'hash' },
  ];
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderLink = (link: typeof navLinks[0], isMobile = false) => {
    const className = isMobile 
      ? "text-lg font-medium text-foreground/80 hover:text-primary transition-colors"
      : "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";

    if (link.type === 'hash') {
      return (
        <HashLink
          key={link.name}
          smooth
          to={link.href}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={className}
        >
          {link.name}
        </HashLink>
      );
    }
    return (
      <Link
        key={link.name}
        to={link.href}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
        className={className}
      >
        {link.name}
      </Link>
    );
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1], delay: 0.5 }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-xl border-b" : "bg-transparent"
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
                <PirateLogo />
            </Link>
            <div className="h-6 w-px bg-border hidden md:block" />
            <nav className="hidden md:flex items-center gap-8">
              <Button variant="ghost" asChild className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-0 hover:bg-transparent">
                <Link to="/exchange">Exchange</Link>
              </Button>
               <Button variant="ghost" asChild className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-0 hover:bg-transparent">
                <Link to="/buy-sell">Buy/Sell Crypto</Link>
              </Button>
              {navLinks.map(link => renderLink(link))}
            </nav>
        </div>
        
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="h-6 w-px bg-border hidden md:block" />
          {user ? (
            <UserNav />
          ) : (
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px]">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-10">
                     <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
                        <PirateLogo />
                    </Link>
                    <SheetClose asChild>
                        <Button variant="ghost" size="icon">
                            <X className="h-6 w-6" />
                        </Button>
                    </SheetClose>
                  </div>
                  <nav className="flex flex-col gap-6">
                    <Link to="/exchange" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors">Exchange</Link>
                    <Link to="/buy-sell" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors">Buy/Sell Crypto</Link>
                    {navLinks.map(link => renderLink(link, true))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
