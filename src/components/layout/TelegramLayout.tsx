import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, Store, MessageCircle, TrendingUp, Bell, Settings, Shield } from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';
import { TelegramWebApp } from '@/types/telegram';
import { FloatingFirstUploadCTA } from '@/components/upload/FloatingFirstUploadCTA';
interface TelegramLayoutProps {
  children: React.ReactNode;
}
interface TabItem {
  path: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  adminOnly?: boolean;
}
const tabs: TabItem[] = [{
  path: '/dashboard',
  icon: Home,
  label: 'Home'
}, {
  path: '/inventory',
  icon: Package,
  label: 'Inventory'
}, {
  path: '/store',
  icon: Store,
  label: 'Store'
}, {
  path: '/chat',
  icon: MessageCircle,
  label: 'Chat'
}, {
  path: '/insights',
  icon: TrendingUp,
  label: 'Insights'
}];
const secondaryTabs: TabItem[] = [{
  path: '/notifications',
  icon: Bell,
  label: 'Notifications'
}, {
  path: '/settings',
  icon: Settings,
  label: 'Settings'
}, {
  path: '/admin',
  icon: Shield,
  label: 'Admin',
  adminOnly: true
}];
export function TelegramLayout({
  children
}: TelegramLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user
  } = useTelegramAuth();
  const [tg, setTg] = useState<any>(null);

  // Simple admin check - you can enhance this based on your needs
  const isAdmin = user?.id === 2138564172 || user?.username === 'admin';

  // Disable back button for store page when accessed publicly (security)
  const isStoreRoute = location.pathname === '/store';
  const isMainRoute = tabs.some(tab => tab.path === location.pathname);
  useTelegramBackButton(!isMainRoute && !isStoreRoute);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const telegramApp = window.Telegram.WebApp;
      setTg(telegramApp);

      // Initialize Telegram WebApp with all features
      try {
        telegramApp.ready();
        telegramApp.expand();

        // Configure header color based on route
        const headerColors = {
          '/dashboard': '#1f2937',
          '/inventory': '#059669',
          '/store': '#7c3aed',
          '/chat': '#0ea5e9',
          '/insights': '#dc2626',
          '/notifications': '#f59e0b',
          '/settings': '#6b7280',
          '/admin': '#ef4444'
        };
        const currentColor = headerColors[location.pathname as keyof typeof headerColors] || '#1f2937';
        if ((telegramApp as any).setHeaderColor) {
          (telegramApp as any).setHeaderColor(currentColor);
        }

        // Apply comprehensive Telegram theme integration
        if (telegramApp.themeParams) {
          const root = document.documentElement;
          const params = telegramApp.themeParams;

          // Map Telegram colors to CSS variables
          root.style.setProperty('--tg-theme-bg-color', params.bg_color || '#ffffff');
          root.style.setProperty('--tg-theme-text-color', params.text_color || '#000000');
          root.style.setProperty('--tg-theme-hint-color', params.hint_color || '#999999');
          root.style.setProperty('--tg-theme-link-color', params.link_color || '#2481cc');
          root.style.setProperty('--tg-theme-button-color', params.button_color || '#2481cc');
          root.style.setProperty('--tg-theme-button-text-color', params.button_text_color || '#ffffff');

          // Apply to document body for full theming
          if (params.bg_color) {
            document.body.style.backgroundColor = params.bg_color;
          }
        }

        // Enhanced viewport handling with safe areas
        const handleViewportChanged = (data?: any) => {
          const height = (telegramApp as any).viewportHeight || window.innerHeight;
          const stableHeight = (telegramApp as any).viewportStableHeight || height;
          document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
          document.documentElement.style.setProperty('--tg-viewport-stable-height', `${stableHeight}px`);

          // Handle safe area insets if available
          if ((telegramApp as any).safeAreaInset) {
            const insets = (telegramApp as any).safeAreaInset;
            document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${insets.top || 0}px`);
            document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${insets.bottom || 0}px`);
            document.documentElement.style.setProperty('--tg-safe-area-inset-left', `${insets.left || 0}px`);
            document.documentElement.style.setProperty('--tg-safe-area-inset-right', `${insets.right || 0}px`);
          }
          console.log('📱 Viewport changed:', {
            height,
            stableHeight,
            isStable: data?.isStateStable
          });
        };

        // Enhanced event handling
        const handleThemeChanged = () => {
          console.log('🎨 Theme changed, reapplying colors');
          if (telegramApp.themeParams) {
            const params = telegramApp.themeParams;
            const root = document.documentElement;
            root.style.setProperty('--tg-theme-bg-color', params.bg_color || '#ffffff');
            root.style.setProperty('--tg-theme-text-color', params.text_color || '#000000');
            if (params.bg_color) {
              document.body.style.backgroundColor = params.bg_color;
            }
          }
        };
        const handleSafeAreaChanged = () => {
          console.log('📱 Safe area changed');
          if ((telegramApp as any).safeAreaInset) {
            const insets = (telegramApp as any).safeAreaInset;
            document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${insets.top || 0}px`);
            document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${insets.bottom || 0}px`);
          }
        };

        // Register event listeners
        handleViewportChanged();
        (telegramApp as any).onEvent?.('viewportChanged', handleViewportChanged);
        (telegramApp as any).onEvent?.('themeChanged', handleThemeChanged);
        (telegramApp as any).onEvent?.('safeAreaChanged', handleSafeAreaChanged);

        // Configure MainButton based on current route
        const configureMainButton = () => {
          const button = (telegramApp as any).MainButton;
          if (button) {
            switch (location.pathname) {
              case '/inventory':
                button.setText('Add Diamond');
                button.color = '#059669';
                button.show();
                button.onClick(() => navigate('/upload'));
                break;
              case '/store':
                button.hide(); // Controlled by individual diamond cards
                break;
              case '/settings':
                button.setText('Save Settings');
                button.color = '#3b82f6';
                button.show();
                break;
              default:
                button.hide();
            }
          }
        };
        configureMainButton();
        return () => {
          // Cleanup event listeners
          (telegramApp as any).offEvent?.('viewportChanged', handleViewportChanged);
          (telegramApp as any).offEvent?.('themeChanged', handleThemeChanged);
          (telegramApp as any).offEvent?.('safeAreaChanged', handleSafeAreaChanged);
          (telegramApp as any).MainButton?.hide();
        };
      } catch (error) {
        console.warn('⚠️ Telegram WebApp setup error:', error);
      }
    }
  }, [location.pathname, navigate]);
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
  // For store page, only show store tab for security (prevent navigation to protected areas)
  const isPublicStoreAccess = location.pathname === '/store' && !user;
  const availableTabs = isPublicStoreAccess ? tabs.filter(tab => tab.path === '/store') : tabs.filter(tab => !tab.adminOnly || isAdmin);
  const availableSecondaryTabs = isPublicStoreAccess ? [] : secondaryTabs.filter(tab => !tab.adminOnly || isAdmin);
  return <div className="flex flex-col h-screen max-h-screen w-full tg-viewport overflow-hidden">
      {/* Main content area */}
      <main className="flex-1 overflow-auto smooth-scroll bg-background w-full py-0">
        <div className="min-h-full p-3 sm:p-4 pb-safe py-4 my-[40px]">
          <div className="w-full max-w-none overflow-x-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* Floating First Upload CTA */}
      <FloatingFirstUploadCTA />

      {/* Bottom tab navigation */}
      <nav className="flex items-center justify-center bg-background/95 backdrop-blur-sm border-t border-border/50 pb-safe shrink-0 w-full">
        <div className="flex items-center justify-around w-full max-w-lg px-2 py-[2px]">
          {availableTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = isActiveTab(tab.path);
          return <button key={tab.path} onClick={() => handleTabClick(tab.path)} className={`
                  flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl touch-target transition-all duration-200 min-w-[60px] sm:min-w-[80px]
                  ${isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
                `} aria-label={tab.label}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                <span className={`text-[10px] sm:text-xs font-medium leading-tight ${isActive ? 'text-primary' : ''}`}>
                  {tab.label}
                </span>
              </button>;
        })}
        </div>
      </nav>

      {/* Secondary actions floating button (for non-main tabs) */}
      {availableSecondaryTabs.length > 0 && <div className="fixed bottom-20 right-4 z-50">
          <div className="flex flex-col gap-2">
            {availableSecondaryTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = isActiveTab(tab.path);
          if (isActive) return null; // Don't show if currently active

          return;
        })}
          </div>
        </div>}
    </div>;
}