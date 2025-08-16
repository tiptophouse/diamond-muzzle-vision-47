
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, Store, MessageCircle, TrendingUp, Bell, Settings, Shield } from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useGroupCTATracking } from '@/hooks/useGroupCTATracking';
import { useModernTelegramWebApp } from '@/hooks/useModernTelegramWebApp';
import { FloatingFirstUploadCTA } from '@/components/upload/FloatingFirstUploadCTA';

interface TelegramLayoutProps {
  children: React.ReactNode;
}

interface TabItem {
  path: string;
  icon: React.ComponentType<{ className?: string; }>;
  label: string;
  adminOnly?: boolean;
}

const tabs: TabItem[] = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/store', icon: Store, label: 'Store' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/insights', icon: TrendingUp, label: 'Insights' }
];

const secondaryTabs: TabItem[] = [
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/admin', icon: Shield, label: 'Admin', adminOnly: true }
];

export function ModernTelegramLayout({ children }: TelegramLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useTelegramAuth();
  const { 
    isReady, 
    hapticFeedback, 
    mainButton, 
    backButton 
  } = useModernTelegramWebApp();

  // Simple admin check
  const isAdmin = user?.id === 2138564172 || user?.username === 'admin';

  // Initialize CTA tracking
  useGroupCTATracking();
  
  useEffect(() => {
    if (!isReady) return;

    // Configure navigation based on current route
    const configureNavigation = () => {
      switch (location.pathname) {
        case '/inventory':
          mainButton.show('Add Diamond', () => {
            hapticFeedback.impact('medium');
            navigate('/upload-single-stone');
          }, '#059669');
          backButton.hide();
          break;
          
        case '/upload-single-stone':
        case '/upload':
          backButton.show(() => {
            hapticFeedback.impact('light');
            navigate(-1);
          });
          mainButton.hide();
          break;
          
        case '/settings':
          backButton.show(() => {
            hapticFeedback.impact('light');
            navigate(-1);
          });
          mainButton.hide();
          break;
          
        default:
          if (location.pathname.startsWith('/diamond/')) {
            backButton.show(() => {
              hapticFeedback.impact('medium');
              navigate(-1);
            });
            mainButton.hide();
          } else {
            backButton.hide();
            mainButton.hide();
          }
      }
    };

    configureNavigation();
  }, [location.pathname, navigate, isReady, hapticFeedback, mainButton, backButton]);

  const handleTabClick = (path: string) => {
    hapticFeedback.selection();
    navigate(path);
  };

  const isActiveTab = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // For store page, only show store tab for security
  const isPublicStoreAccess = location.pathname === '/store' && !user;
  const availableTabs = isPublicStoreAccess 
    ? tabs.filter(tab => tab.path === '/store') 
    : tabs.filter(tab => !tab.adminOnly || isAdmin);
  const availableSecondaryTabs = isPublicStoreAccess 
    ? [] 
    : secondaryTabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="flex flex-col w-full tg-viewport overflow-hidden bg-background" 
         style={{ 
           height: 'var(--tg-viewport-height, 100dvh)', 
           maxHeight: 'var(--tg-viewport-stable-height, 100dvh)' 
         }}>
      {/* Main content area */}
      <main className="flex-1 overflow-auto smooth-scroll bg-background w-full py-0" 
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}>
        <div className="min-h-full p-3 sm:p-4 pt-4">
          <div className="w-full max-w-none overflow-x-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* Floating First Upload CTA */}
      <FloatingFirstUploadCTA />

      {/* Bottom tab navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-card/90 supports-[backdrop-filter]:bg-card/70 backdrop-blur-md border-t border-border/50 w-full" 
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around w-full max-w-xl px-2 py-2">
          {availableTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = isActiveTab(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={`
                  flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl touch-target transition-all duration-200 min-w-[60px] sm:min-w-[80px]
                  ${isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
                aria-label={tab.label}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                <span className={`text-[10px] sm:text-xs font-medium leading-tight ${isActive ? 'text-primary' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
