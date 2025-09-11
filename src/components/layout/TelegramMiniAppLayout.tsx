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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 pb-20">
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
                onClick={handleNavClick}
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
    </div>
  );
}