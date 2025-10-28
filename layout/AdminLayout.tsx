import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowRightLeft,
  Users2,
  Settings,
  PanelLeft,
  GalleryVerticalEnd,
  Trophy,
  Palette,
} from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import UserNav from './UserNav';
import { cn } from '@/lib/utils';
import { PirateLogo } from '../ui/logo-icon';
import { ThemeToggle } from '../ui/theme-toggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Orders', icon: ArrowRightLeft },
    { to: '/admin/customers', label: 'Customers', icon: Users2 },
    { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/admin/content', label: 'Content', icon: GalleryVerticalEnd },
    { to: '/admin/appearance', label: 'Appearance', icon: Palette },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-card/80 backdrop-blur-xl sm:flex">
        <div className="flex h-20 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <PirateLogo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 3}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                isActive && "text-foreground bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col sm:pl-64">
        <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:px-6">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs bg-card/95 backdrop-blur-xl">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex h-10 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:text-base"
                >
                  <PirateLogo />
                  <span className="sr-only">Pirate Exchange</span>
                </Link>
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin/dashboard">Admin</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathnames.slice(1).map((value, index) => {
                const to = `/admin/${pathnames.slice(1, index + 2).join('/')}`;
                const isLast = index === pathnames.length - 2;
                return (
                  <React.Fragment key={to}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="capitalize">{value.replace(/-/g, ' ')}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={to} className="capitalize">{value.replace(/-/g, ' ')}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
