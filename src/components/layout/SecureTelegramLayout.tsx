import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Package, Store, Bot, BarChart3, Shield, Sparkles } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { cn } from '@/lib/utils';

interface SecureTelegramLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    to: '/dashboard',
    icon: Home,
    label: 'Dashboard',
    activePattern: /^\/(dashboard)?$/
  },
  {
    to: '/inventory',
    icon: Package,
    label: 'Inventory',
    activePattern: /^\/inventory/
  },
  {
    to: '/store',
    icon: Store,
    label: 'Store',
    activePattern: /^\/store|catalog/
  },
  {
    to: '/diamond-agents',
    icon: Bot,
    label: 'AI Agents',
    activePattern: /^\/diamond-agents/,
    badge: 'NEW'
  },
  {
    to: '/insights',
    icon: BarChart3,
    label: 'Insights',
    activePattern: /^\/insights|analytics/
  }
];

export function SecureTelegramLayout({ children }: SecureTelegramLayoutProps) {
  const location = useLocation();
  const { selectionChanged } = useTelegramHapticFeedback();
  const { isAuthenticated, user } = useTelegramAuth();

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  const handleNavClick = () => {
    selectionChanged();
  };

  // Don't render navigation for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col ios-scroll">
      {/* Security Header - Compact for Mobile */}
      <div className="bg-primary/5 border-b border-primary/10 px-4 py-3 pt-safe">
        <div className="flex items-center justify-between max-w-screen-sm mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-medium">JWT Secured</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {user?.first_name}
          </div>
        </div>
      </div>

      {/* Main Content Area with Telegram Mini App optimization */}
      <main className="flex-1 pb-24 ios-scroll overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation - Telegram Mini App Optimized */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-40 pb-safe-or-4">
        <div className="grid grid-cols-5 max-w-screen-sm mx-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.activePattern);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center justify-center py-4 px-3 min-h-[64px] text-sm transition-colors duration-200 touch-manipulation relative",
                  "active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  active 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon 
                  className={cn(
                    "h-6 w-6 mb-1",
                    active && "text-primary"
                  )} 
                />
                <span className={cn(
                  "font-medium text-xs leading-tight",
                  active && "text-primary"
                )}>
                  {item.label}
                </span>
                {item.badge && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold animate-pulse flex items-center gap-1">
                    <Sparkles className="h-2 w-2" />
                    {item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}