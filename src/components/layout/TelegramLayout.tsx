import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Store, 
  MessageCircle, 
  TrendingUp,
  Bell,
  Settings,
  Shield
} from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';
import { TelegramWebApp } from '@/types/telegram';

interface TelegramLayoutProps {
  children: React.ReactNode;
}

interface TabItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  adminOnly?: boolean;
}

const tabs: TabItem[] = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/store', icon: Store, label: 'Store' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/insights', icon: TrendingUp, label: 'Insights' },
];

const secondaryTabs: TabItem[] = [
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/admin', icon: Shield, label: 'Admin', adminOnly: true },
];

export function TelegramLayout({ children }: TelegramLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useTelegramAuth();
  const [tg, setTg] = useState<any>(null);

  // Simple admin check - you can enhance this based on your needs
  const isAdmin = user?.id === 2138564172 || user?.username === 'admin';

  // Enable back button for non-main routes
  const isMainRoute = tabs.some(tab => tab.path === location.pathname);
  useTelegramBackButton(!isMainRoute);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const telegramApp = window.Telegram.WebApp;
      setTg(telegramApp);

      // Initialize Telegram WebApp
      telegramApp.ready();
      telegramApp.expand();

      // Apply Telegram theme
      if (telegramApp.themeParams) {
        const root = document.documentElement;
        root.style.setProperty('--tg-theme-bg-color', telegramApp.themeParams.bg_color || '#ffffff');
        root.style.setProperty('--tg-theme-text-color', telegramApp.themeParams.text_color || '#000000');
        root.style.setProperty('--tg-theme-hint-color', telegramApp.themeParams.hint_color || '#999999');
        root.style.setProperty('--tg-theme-link-color', telegramApp.themeParams.link_color || '#2481cc');
        root.style.setProperty('--tg-theme-button-color', telegramApp.themeParams.button_color || '#2481cc');
        root.style.setProperty('--tg-theme-button-text-color', telegramApp.themeParams.button_text_color || '#ffffff');
      }

      // Handle viewport changes
      const handleViewportChanged = () => {
        const height = (telegramApp as any).viewportHeight || window.innerHeight;
        document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
      };

      handleViewportChanged();
      // Use any type for event handlers as they're not in the interface
      (telegramApp as any).onEvent?.('viewportChanged', handleViewportChanged);

      return () => {
        (telegramApp as any).offEvent?.('viewportChanged', handleViewportChanged);
      };
    }
  }, []);

  const handleTabClick = (path: string) => {
    // Add haptic feedback
    if ((tg as any)?.HapticFeedback) {
      (tg as any).HapticFeedback.selectionChanged();
    }
    navigate(path);
  };

  const isActiveTab = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const availableTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);
  const availableSecondaryTabs = secondaryTabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="flex flex-col h-screen max-h-screen tg-viewport">
      {/* Header with safe area */}
      <header className="flex items-center justify-between p-4 pt-safe bg-background/95 backdrop-blur-sm border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">💎</span>
          </div>
          <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Diamond Mazal
          </h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.first_name}
            </span>
            {user.photo_url ? (
              <img 
                src={user.photo_url} 
                alt={user.first_name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium text-sm">
                  {user.first_name?.[0]}
                </span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-auto smooth-scroll bg-background">
        <div className="min-h-full p-4 pb-safe">
          {children}
        </div>
      </main>

      {/* Bottom tab navigation */}
      <nav className="flex items-center justify-center bg-background/95 backdrop-blur-sm border-t border-border/50 pb-safe shrink-0">
        <div className="flex items-center justify-around w-full max-w-md px-2">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isActiveTab(tab.path);
            
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-xl touch-target transition-all duration-200
                  ${isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
                aria-label={tab.label}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Secondary actions floating button (for non-main tabs) */}
      {availableSecondaryTabs.length > 0 && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="flex flex-col gap-2">
            {availableSecondaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = isActiveTab(tab.path);
              
              if (isActive) return null; // Don't show if currently active
              
              return (
                <button
                  key={tab.path}
                  onClick={() => handleTabClick(tab.path)}
                  className="
                    w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg 
                    flex items-center justify-center touch-target
                    hover:scale-110 active:scale-95 transition-all duration-200
                  "
                  aria-label={tab.label}
                >
                  <Icon className="w-6 h-6" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}