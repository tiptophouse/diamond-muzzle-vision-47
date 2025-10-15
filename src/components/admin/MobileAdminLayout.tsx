import { ReactNode, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Share2, 
  Settings,
  ChevronLeft,
  Bell,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface MobileAdminLayoutProps {
  children: ReactNode;
}

const bottomNavItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, url: '?tab=overview' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, url: '?tab=analytics' },
  { id: 'users', label: 'Users', icon: Users, url: '?tab=users' },
  { id: 'campaigns', label: 'Campaigns', icon: Share2, url: '?tab=campaigns' },
];

export function MobileAdminLayout({ children }: MobileAdminLayoutProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { webApp, isReady } = useTelegramWebApp();
  const { impactOccurred, notificationOccurred, selectionChanged } = useTelegramHapticFeedback();

  // Initialize Telegram WebApp theme and viewport
  useEffect(() => {
    if (isReady && webApp) {
      // Apply Telegram theme colors
      document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.backgroundColor || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams?.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-viewport-height', `${webApp.viewportHeight}px`);
      
      // Expand viewport
      webApp.expand();
      
      // Enable closing confirmation
      webApp.enableClosingConfirmation();
    }
  }, [isReady, webApp]);

  const handleTabChange = (tabId: string) => {
    selectionChanged();
    impactOccurred('light');
    setSearchParams({ tab: tabId });
  };

  const handleBackClick = () => {
    impactOccurred('medium');
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Beautiful Mobile Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-primary via-primary to-secondary shadow-xl border-b border-white/10">
        <div className="px-4 pt-safe">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={handleBackClick}
              className="p-2 -ml-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-white tracking-tight">Admin Dashboard</h1>
              <p className="text-xs text-white/70">Real-time insights</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  impactOccurred('light');
                  notificationOccurred('success');
                }}
                className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all relative min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Bell className="h-5 w-5 text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overscroll-behavior-contain pb-24" style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}>
        <div className="p-4 space-y-4 animate-fade-in">
          {children}
        </div>
      </main>

      {/* Modern Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
        {/* Glass morphism background */}
        <div className="absolute inset-0 backdrop-blur-xl bg-card/95 border-t border-border/50 shadow-2xl" />
        
        {/* Active indicator background */}
        <div className="relative grid grid-cols-4 h-20 px-2">
          {bottomNavItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300 touch-target",
                  "active:scale-95",
                  isActive && "scale-105"
                )}
              >
                {/* Active background glow */}
                {isActive && (
                  <div className="absolute inset-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl blur-xl" />
                )}
                
                {/* Icon container */}
                <div className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-br from-primary to-secondary shadow-lg" 
                    : "bg-transparent"
                )}>
                  <Icon className={cn(
                    "h-6 w-6 transition-all duration-300",
                    isActive ? "text-white scale-110" : "text-muted-foreground"
                  )} />
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-xs font-medium transition-all duration-300 relative",
                  isActive 
                    ? "text-primary font-bold" 
                    : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
