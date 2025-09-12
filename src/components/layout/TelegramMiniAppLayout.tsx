import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Package, Store, MessageCircle, BarChart3 } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
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
  const { webApp, rawWebApp } = useEnhancedTelegramWebApp();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  const handleNavClick = () => {
    // Minimal haptic feedback only for navigation
  };

  // Monitor fullscreen state changes
  useEffect(() => {
    if (!rawWebApp) return;

    const checkFullscreenState = () => {
      const fullscreenState = rawWebApp.isExpanded && rawWebApp.viewportHeight >= window.screen.height * 0.9;
      setIsFullscreen(fullscreenState);
      
      // Update CSS variables for fullscreen
      if (fullscreenState) {
        document.documentElement.style.setProperty('--tg-fullscreen-height', `${rawWebApp.viewportHeight}px`);
        document.documentElement.classList.add('telegram-fullscreen');
      } else {
        document.documentElement.classList.remove('telegram-fullscreen');
      }
    };

    // Initial check
    checkFullscreenState();

    // Listen for viewport changes
    const handleViewportChange = () => {
      checkFullscreenState();
    };

    if (rawWebApp.onEvent) {
      rawWebApp.onEvent('viewportChanged', handleViewportChange);
      return () => {
        rawWebApp.offEvent('viewportChanged', handleViewportChange);
      };
    }
  }, [rawWebApp]);

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col ios-viewport",
      isFullscreen && "fullscreen-container"
    )}>
      {/* Main Content Area with fullscreen support */}
      <main className={cn(
        "flex-1 pb-20 pt-safe ios-scroll",
        isFullscreen ? "fullscreen-content pb-16" : "pb-20"
      )}>
        {children}
      </main>

      {/* Bottom Navigation with fullscreen awareness */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 pb-safe",
        isFullscreen && "bottom-nav-ios fullscreen"
      )} style={{ backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
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
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
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