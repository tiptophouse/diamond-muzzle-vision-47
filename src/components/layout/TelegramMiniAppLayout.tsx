
import React, { memo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Package, Store, MessageCircle, BarChart3 } from 'lucide-react';
import { useUnifiedTelegramWebApp } from '@/hooks/useUnifiedTelegramWebApp';
import { cn } from '@/lib/utils';

interface TelegramMiniAppLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    to: '/',
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
    to: '/chat',
    icon: MessageCircle,
    label: 'Chat',
    activePattern: /^\/chat/
  },
  {
    to: '/insights',
    icon: BarChart3,
    label: 'Insights',
    activePattern: /^\/insights|analytics/
  }
];

export const TelegramMiniAppLayout = memo(function TelegramMiniAppLayout({ children }: TelegramMiniAppLayoutProps) {
  const location = useLocation();
  const { haptics, webApp } = useUnifiedTelegramWebApp();

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  const handleNavClick = () => {
    haptics.selection();
  };

  // Apply safe area insets for iOS
  const safeAreaBottom = webApp?.safeAreaInset.bottom || 0;
  const safeAreaTop = webApp?.safeAreaInset.top || 0;

  return (
    <div 
      className="min-h-screen bg-background flex flex-col"
      style={{
        paddingTop: `${safeAreaTop}px`,
        paddingBottom: `${Math.max(safeAreaBottom, 20)}px`
      }}
    >
      {/* Main Content Area - Optimized for Telegram viewport */}
      <main className="flex-1 pb-20 overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Navigation - Telegram-style */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50"
        style={{ paddingBottom: `${safeAreaBottom}px` }}
      >
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
                  "flex flex-col items-center justify-center py-2 px-2 text-xs transition-all duration-200 min-h-[60px] touch-manipulation",
                  "active:scale-95 active:bg-accent/20",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 mb-1 transition-all duration-200",
                    active && "text-primary scale-110"
                  )} 
                />
                <span className={cn(
                  "font-medium text-[10px] leading-tight",
                  active && "text-primary font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
});
