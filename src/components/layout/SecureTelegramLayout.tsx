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
      {/* Security Header */}
      <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 pt-safe">
        <div className="flex items-center justify-between max-w-screen-sm mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-primary" />
            <span>Secured via JWT</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {user?.first_name} • ID: {user?.id}
          </div>
        </div>
      </div>

      {/* Main Content Area with iOS scroll optimization */}
      <main className="flex-1 pb-20 ios-scroll overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation - Only for authenticated users with safe area */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 pb-safe">
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
                  "flex flex-col items-center justify-center py-3 px-2 text-xs transition-colors duration-200 clickable relative",
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
                {item.badge && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1">
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