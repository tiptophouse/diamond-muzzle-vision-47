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
      <div className="min-h-screen bg-background telegram-viewport">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col ios-scroll telegram-viewport">
      {/* Security Header - Ultra Compact for Mobile */}
      <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 pt-safe backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-screen-sm mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-primary" />
            <span className="font-medium">Secure</span>
          </div>
          <div className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
            {user?.first_name}
          </div>
        </div>
      </div>

      {/* Main Content Area with Enhanced Mobile Optimization */}
      <main className="flex-1 pb-20 ios-scroll overflow-y-auto scroll-smooth-contained">
        <div className="animate-slide-up">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Enhanced Telegram Mini App Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/30 z-50 pb-safe-or-4 shadow-lg">
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
                  "flex flex-col items-center justify-center py-3 px-2 min-h-[64px] text-xs transition-all duration-200 touch-manipulation relative will-change-transform",
                  "active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset rounded-lg mx-1",
                  active 
                    ? "text-primary bg-primary/10 scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 mb-1 transition-all duration-200",
                    active && "text-primary scale-110"
                  )} 
                />
                <span className={cn(
                  "font-medium text-xs leading-tight transition-all duration-200",
                  active && "text-primary font-semibold"
                )}>
                  {item.label}
                </span>
                {item.badge && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse-glow flex items-center gap-1 shadow-lg">
                    <Sparkles className="h-2 w-2" />
                    {item.badge}
                  </div>
                )}
                {active && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full animate-scale-in" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}