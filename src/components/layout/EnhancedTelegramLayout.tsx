
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Package, Store, MessageCircle, TrendingUp, Settings } from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSecureNavigation } from '@/hooks/useSecureNavigation';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { FloatingFirstUploadCTA } from '@/components/upload/FloatingFirstUploadCTA';

interface EnhancedTelegramLayoutProps {
  children: React.ReactNode;
}

const mainTabs = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/store', icon: Store, label: 'Store' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/insights', icon: TrendingUp, label: 'Insights' }
];

export function EnhancedTelegramLayout({ children }: EnhancedTelegramLayoutProps) {
  const location = useLocation();
  const { user } = useTelegramAuth();
  const { webApp, isInitialized } = useEnhancedTelegramWebApp();
  const { haptics } = useSecureNavigation();

  // Handle tab navigation with enhanced haptics
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

  // Enhanced iPhone viewport handling
  const viewportStyle = webApp ? {
    height: `${webApp.viewportStableHeight}px`,
    paddingTop: `${webApp.safeAreaInset.top}px`
  } : { height: '100vh' };

  // iPhone-specific CSS variables
  useEffect(() => {
    if (webApp && isInitialized) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        document.documentElement.style.setProperty('--ios-safe-area-top', `${webApp.safeAreaInset.top}px`);
        document.documentElement.style.setProperty('--ios-safe-area-bottom', `${webApp.safeAreaInset.bottom}px`);
        document.documentElement.style.setProperty('--ios-viewport-height', `${webApp.viewportStableHeight}px`);
      }
    }
  }, [webApp, isInitialized]);

  return (
    <div 
      className="flex flex-col w-full overflow-hidden bg-background"
      style={viewportStyle}
    >
      {/* Main content with iPhone safe area consideration */}
      <main 
        className="flex-1 overflow-auto bg-background w-full"
        style={{ 
          paddingBottom: `calc(${webApp?.safeAreaInset.bottom || 0}px + 64px)`,
          paddingTop: webApp?.platform === 'ios' ? '8px' : '0px'
        }}
      >
        <div className="min-h-full p-3 sm:p-4">
          <div className="w-full max-w-none overflow-x-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* Floating First Upload CTA */}
      <FloatingFirstUploadCTA />

      {/* Enhanced bottom navigation with iPhone optimization */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50"
        style={{ 
          paddingBottom: `${webApp?.safeAreaInset.bottom || 0}px`,
          height: `calc(56px + ${webApp?.safeAreaInset.bottom || 0}px)`
        }}
      >
        <div className="flex items-center justify-around w-full h-[56px] px-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isActiveTab(tab.path);
            
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={`
                  flex flex-col items-center gap-0.5 p-1.5 sm:p-2 rounded-lg 
                  transition-all duration-200 min-w-[52px] sm:min-w-[64px]
                  active:scale-95 touch-manipulation
                  ${isActive 
                    ? 'text-primary bg-primary/10 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
                aria-label={tab.label}
              >
                <Icon 
                  className={`
                    w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200
                    ${isActive ? 'scale-110' : ''}
                  `} 
                />
                <span className={`
                  text-[9px] sm:text-[10px] font-medium leading-tight
                  ${isActive ? 'text-primary' : ''}
                `}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Settings button for iPhone (positioned for safe area) */}
      <button
        onClick={() => {
          haptics.light();
          window.location.href = '/settings';
        }}
        className="fixed right-4 z-40 bg-card/90 backdrop-blur-sm border border-border/50 rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        style={{ 
          bottom: `calc(${webApp?.safeAreaInset.bottom || 0}px + 68px)`
        }}
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
