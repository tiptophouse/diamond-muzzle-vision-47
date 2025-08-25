
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Package, Store, MessageCircle, TrendingUp, Settings } from 'lucide-react';
import { useTelegramNavigation } from '@/hooks/useTelegramNavigation';
import WebApp from '@twa-dev/sdk';

interface TelegramLayoutProps {
  children: React.ReactNode;
}

const mainTabs = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/store', icon: Store, label: 'Store' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/insights', icon: TrendingUp, label: 'Insights' }
];

export function TelegramLayout({ children }: TelegramLayoutProps) {
  const location = useLocation();
  const { haptics } = useTelegramNavigation();

  // Setup WebApp theme and viewport
  useEffect(() => {
    if (WebApp) {
      // Set theme colors
      WebApp.setHeaderColor('#ffffff');
      WebApp.setBackgroundColor('#f8fafc');
      
      // Enable closing confirmation
      WebApp.enableClosingConfirmation();
      
      // Setup viewport for mobile optimization
      const updateViewport = () => {
        const vh = WebApp.viewportStableHeight || WebApp.viewportHeight || window.innerHeight;
        document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
      };
      
      updateViewport();
      WebApp.onEvent('viewportChanged', updateViewport);
      
      return () => {
        WebApp.offEvent('viewportChanged', updateViewport);
      };
    }
  }, []);

  const handleTabClick = (path: string) => {
    haptics.selection();
    window.location.href = path;
  };

  const isActiveTab = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20">
        <div className="container mx-auto p-4 max-w-7xl">
          {children}
        </div>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isActiveTab(tab.path);
            
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={`
                  flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200
                  min-w-[60px] active:scale-95 touch-manipulation
                  ${isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
                aria-label={tab.label}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Settings button */}
      <button
        onClick={() => {
          haptics.light();
          window.location.href = '/settings';
        }}
        className="fixed right-4 bottom-20 z-40 bg-card/90 backdrop-blur-sm border border-border rounded-full p-3 
                   shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
