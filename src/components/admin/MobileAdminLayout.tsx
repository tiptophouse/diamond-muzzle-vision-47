import { ReactNode, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Share2, 
  Settings,
  Home,
  ChevronLeft
} from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { cn } from '@/lib/utils';

interface MobileAdminLayoutProps {
  children: ReactNode;
}

const bottomNavItems = [
  { id: 'monitor', label: 'Monitor', icon: LayoutDashboard, url: '?tab=monitor' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, url: '?tab=analytics' },
  { id: 'users', label: 'Users', icon: Users, url: '?tab=users' },
  { id: 'campaigns', label: 'Campaigns', icon: Share2, url: '?tab=campaigns' },
];

export function MobileAdminLayout({ children }: MobileAdminLayoutProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'monitor';
  const { webApp, hapticFeedback } = useTelegramWebApp();

  const handleTabChange = (tabId: string) => {
    hapticFeedback.impact('light');
    setSearchParams({ tab: tabId });
  };

  const handleBack = () => {
    hapticFeedback.impact('light');
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
        <div className="flex items-center h-14 px-4 pt-safe">
          <button 
            onClick={handleBack}
            className="p-2 -ml-2 touch-target active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-lg font-bold ml-2">Admin Panel</h1>
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 -mr-2 touch-target active:scale-95 transition-transform"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content - with bottom padding for nav */}
      <main className="flex-1 overflow-y-auto pb-20 pt-safe-or-3">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Telegram Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg pb-safe-or-4">
        <div className="grid grid-cols-4 h-16">
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 touch-target transition-all",
                  "active:scale-95",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className={cn(
                  "h-6 w-6 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
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
