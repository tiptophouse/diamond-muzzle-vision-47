import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Package, Store, Bot, BarChart3, Sparkles } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';

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

  const handleNavClick = (label: string) => {
    selectionChanged();
    logger.telegramAction('bottom_nav_click', { destination: label, from: location.pathname });
  };

  // Ensure Telegram WebApp is configured properly
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Configure for Telegram Mini App
      tg.ready();
      tg.expand();
      
      logger.telegramAction('layout_mounted', { 
        platform: (tg as any).platform || 'unknown',
        version: (tg as any).version || 'unknown',
        path: location.pathname
      });
    }
  }, [location.pathname]);

  // Don't render navigation for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col ios-scroll w-full">
      {/* Main Content Area with Telegram Mini App optimization */}
      <main className="flex-1 pb-20 ios-scroll overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation - Optimized for Telegram Mini App (Compact 4-item layout) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-20 pb-safe-or-4 pointer-events-auto" style={{ WebkitTapHighlightColor: 'transparent' }}>
        <div className="grid grid-cols-4 max-w-screen-sm mx-auto">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.activePattern);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => handleNavClick(item.label)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 min-h-[56px] text-sm transition-colors duration-200 touch-manipulation relative pointer-events-auto",
                  "active:scale-95 focus:outline-none",
                  active 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon 
                  className={cn(
                    "h-4 w-4 mb-1",
                    active && "text-primary"
                  )} 
                />
                <span 
                  className={cn(
                    "text-[10px] font-medium truncate",
                    active && "text-primary font-semibold"
                  )}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <div className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] px-1 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-0.5">
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