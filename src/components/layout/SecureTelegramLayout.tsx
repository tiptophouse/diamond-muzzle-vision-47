import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Package, Store, MessageCircle, BarChart3, Shield, Bell, User } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';
import { Badge } from '@/components/ui/badge';
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

const auxiliaryItems = [
  {
    to: '/notifications',
    icon: Bell,
    label: 'Notifications',
    activePattern: /^\/notifications/,
    hasNotifications: true
  },
  {
    to: '/profile',
    icon: User,
    label: 'Profile', 
    activePattern: /^\/profile/
  }
];

export function SecureTelegramLayout({ children }: SecureTelegramLayoutProps) {
  const location = useLocation();
  const { selectionChanged } = useTelegramHapticFeedback();
  const { isAuthenticated, user } = useTelegramAuth();
  const { notifications } = useFastApiNotifications();

  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  const handleNavClick = () => {
    selectionChanged();
  };

  // Don't render navigation for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background telegram-safe-area">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col telegram-safe-area">
      {/* Security Header - Responsive */}
      <div className="telegram-header">
        <div className="bg-primary/5 border-b border-primary/10 px-3 md:px-4 py-2">
          <div className="flex items-center justify-between max-w-screen-sm mx-auto">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3 text-primary" />
              <span className="hidden sm:inline">Secured via JWT</span>
              <span className="sm:hidden">Secure</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">{user?.first_name}</span>
              <span className="sm:hidden">•</span>
              <span className="text-xs">ID: {user?.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with responsive padding */}
      <main className="flex-1 pb-20 ios-scroll overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation - Mobile First Design */}
      <nav className="telegram-navigation">
        <div className="px-2">
          {/* Primary Navigation - 5 columns on mobile */}
          <div className="grid grid-cols-5 py-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.activePattern);
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-1 text-xs transition-all duration-200 clickable touch-target",
                    active 
                      ? "text-[var(--tg-theme-button-color)]" 
                      : "text-[var(--tg-theme-hint-color)]"
                  )}
                >
                  <Icon 
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5 mb-1",
                      active && "text-[var(--tg-theme-button-color)]"
                    )} 
                  />
                  <span className={cn(
                    "font-medium leading-tight text-xs",
                    active && "text-[var(--tg-theme-button-color)]"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Auxiliary Items - Compact Row */}
          <div className="flex justify-center items-center space-x-6 py-2 border-t border-border/20">
            {auxiliaryItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.activePattern);
              const showBadge = item.hasNotifications && unreadCount > 0;
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={cn(
                    "relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-200 clickable touch-target",
                    active 
                      ? "bg-[var(--tg-theme-button-color)] text-white" 
                      : "text-[var(--tg-theme-hint-color)] hover:bg-[var(--tg-theme-secondary-bg-color)]"
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  {showBadge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs p-0 min-w-[16px] sm:min-w-[20px] rounded-full"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}