import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Package, Store, MessageCircle, BarChart3 } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { cn } from '@/lib/utils';

interface TelegramMiniAppLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    to: '/',
    icon: Home,
    label: 'Home',
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
  const { selectionChanged, impactOccurred } = useTelegramHapticFeedback();
  const { webApp, isReady } = useTelegramWebApp();

  useEffect(() => {
    if (isReady && webApp) {
      // Configure Telegram WebApp for optimal mobile experience
      webApp.ready();
      webApp.expand();
      
      // Set theme colors based on Telegram theme
      const themeParams = webApp.themeParams;
      if (themeParams) {
        document.documentElement.style.setProperty('--tg-color-scheme', webApp.colorScheme);
        document.documentElement.style.setProperty('--tg-bg-color', themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-text-color', themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-hint-color', themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-link-color', themeParams.link_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-button-color', themeParams.button_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-button-text-color', themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-secondary-bg-color', themeParams.secondary_bg_color || '#f1f1f1');
      }

      // Set viewport height to account for Telegram UI
      const setViewportHeight = () => {
        const vh = webApp.viewportHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      setViewportHeight();
      webApp.onEvent('viewportChanged', setViewportHeight);

      return () => {
        webApp.offEvent('viewportChanged', setViewportHeight);
      };
    }
  }, [isReady, webApp]);

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  const handleNavClick = () => {
    selectionChanged();
    impactOccurred('light');
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ 
        height: 'calc(var(--vh, 1vh) * 100)',
        backgroundColor: 'var(--tg-bg-color, hsl(var(--background)))',
        color: 'var(--tg-text-color, hsl(var(--foreground)))'
      }}
    >
      {/* Main Content Area with proper spacing for navigation */}
      <main className="flex-1 overflow-y-auto pb-[80px] relative">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* Fixed Bottom Navigation - Telegram Mini App Style */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-md"
        style={{ 
          backgroundColor: 'var(--tg-secondary-bg-color, hsl(var(--background)))',
          borderTopColor: 'var(--tg-hint-color, hsl(var(--border)))'
        }}
      >
        <div className="flex items-center justify-around px-2 py-3 max-w-screen-sm mx-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.activePattern);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] relative",
                  "active:scale-95 hover:scale-105",
                  active 
                    ? "scale-105" 
                    : "opacity-70 hover:opacity-100"
                )}
                style={{
                  color: active 
                    ? 'var(--tg-link-color, hsl(var(--primary)))' 
                    : 'var(--tg-hint-color, hsl(var(--muted-foreground)))'
                }}
              >
                {/* Active indicator */}
                {active && (
                  <div 
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--tg-link-color, hsl(var(--primary)))' }}
                  />
                )}
                
                <Icon 
                  className={cn(
                    "h-6 w-6 mb-1 transition-all duration-200",
                    active && "animate-pulse"
                  )} 
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={cn(
                  "text-[10px] font-medium leading-tight transition-all duration-200",
                  active && "font-semibold"
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