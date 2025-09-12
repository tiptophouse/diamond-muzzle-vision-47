
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
          paddingBottom: `calc(${webApp?.safeAreaInset.bottom || 0}px + 80px)`,
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
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border"
        style={{ 
          paddingBottom: `${webApp?.safeAreaInset.bottom || 0}px`,
          height: `calc(72px + ${webApp?.safeAreaInset.bottom || 0}px)`,
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none'
        }}
      >
        <div className="flex items-center justify-around w-full h-[72px] px-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isActiveTab(tab.path);
            
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={`
                  flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl 
                  transition-all duration-200 min-w-[60px] sm:min-w-[80px]
                  active:scale-95 touch-manipulation
                  ${isActive 
                    ? 'text-primary bg-primary/10 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
                aria-label={tab.label}
              >
                <Icon 
                  className={`
                    w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200
                    ${isActive ? 'scale-110' : ''}
                  `} 
                />
                <span className={`
                  text-[10px] sm:text-xs font-medium leading-tight
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
        className="fixed right-4 z-40 bg-card border border-border rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        style={{ 
          bottom: `calc(${webApp?.safeAreaInset.bottom || 0}px + 88px)`
        }}
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
