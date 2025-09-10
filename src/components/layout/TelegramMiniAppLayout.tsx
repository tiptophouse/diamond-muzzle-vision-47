import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Package, Store, MessageCircle, BarChart3 } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
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

export function TelegramMiniAppLayout({ children }: TelegramMiniAppLayoutProps) {
  const location = useLocation();
  const { selectionChanged } = useTelegramHapticFeedback();

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  const handleNavClick = () => {
    selectionChanged();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col ios-viewport">
      {/* Main Content Area with safe area support */}
      <main className="flex-1 pb-20 pt-safe ios-scroll">
        {children}
      </main>

      {/* Bottom Navigation with enhanced safe area and responsive design */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 pb-safe bottom-nav-ios">
        <div className="grid grid-cols-5 w-full max-w-full mx-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.activePattern);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors duration-200 min-h-[60px] mobile-tap",
                  "touch-action-manipulation select-none",
                  active 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 mb-1 flex-shrink-0",
                    active && "text-primary"
                  )} 
                />
                <span className={cn(
                  "font-medium text-[10px] leading-tight text-center truncate max-w-full",
                  active && "text-primary"
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
}