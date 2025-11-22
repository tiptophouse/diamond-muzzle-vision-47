import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Package, Store, MessageCircle, BarChart3 } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useTelegramPerformance } from '@/hooks/useTelegramPerformance';
import { cn } from '@/lib/utils';
import { FloatingNotificationButton } from '@/components/notifications/FloatingNotificationButton';
import { FloatingAdminButton } from '@/components/admin/FloatingAdminButton';
import { logger } from '@/utils/logger';

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
  const { triggerHapticFeedback, optimizeForMobile, isOptimized } = useTelegramPerformance();

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  const handleNavClick = (label: string) => {
    selectionChanged();
    triggerHapticFeedback('selection');
    logger.telegramAction('navigation_click', { destination: label, from: location.pathname });
  };

  // Apply mobile optimizations on mount
  React.useEffect(() => {
    optimizeForMobile();
    logger.telegramAction('layout_mounted', { 
      isOptimized, 
      currentPath: location.pathname 
    });
  }, [optimizeForMobile, isOptimized, location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
       {/* Main Content Area */}
-      <main className="flex-1 pb-20">
+      <main className="flex-1 pb-20 pt-safe-or-3">
         {children}
       </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="grid grid-cols-5 max-w-screen-sm mx-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.activePattern);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => handleNavClick(item.label)}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-2 text-xs transition-colors duration-200",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 mb-1",
                    active && "text-primary"
                  )} 
                />
                <span className={cn(
                  "font-medium",
                  active && "text-primary"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Buttons */}
      <FloatingNotificationButton className="bottom-20 right-4 md:bottom-24 md:right-6" />
      <FloatingAdminButton className="bottom-20 right-20 md:bottom-24 md:right-24" />
    </div>
  );
}