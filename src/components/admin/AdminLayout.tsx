import { ReactNode, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { user } = useTelegramAuth();
  const { navigation, haptics, webApp } = useEnhancedTelegramWebApp();

  // Set up Telegram SDK controls
  useEffect(() => {
    if (!webApp) return;

    // Show back button that goes to dashboard
    navigation.showBackButton(() => {
      haptics?.light();
      navigate('/dashboard');
    });

    // Apply iOS safe area
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && webApp.safeAreaInset) {
      document.documentElement.style.setProperty(
        '--admin-safe-area-top', 
        `${webApp.safeAreaInset.top}px`
      );
      document.documentElement.style.setProperty(
        '--admin-safe-area-bottom', 
        `${webApp.safeAreaInset.bottom}px`
      );
    }

    return () => {
      navigation.hideBackButton();
    };
  }, [webApp, navigation, haptics, navigate]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <SidebarInset className="flex-1">
          {/* Top Navigation Bar with iOS safe area */}
          <header 
            className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
            style={{ paddingTop: 'var(--admin-safe-area-top, 0px)' }}
          >
            <div className="flex items-center gap-4 px-6">
              <SidebarTrigger className="h-8 w-8 hover:bg-sidebar-accent pointer-events-auto z-50" style={{ isolation: 'isolate' }} />
              
              <div className="hidden h-6 w-px bg-border md:block" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="hidden gap-2 md:flex hover:bg-sidebar-accent"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </div>

            <div className="ml-auto flex items-center gap-4 px-6">
              <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>System Online</span>
              </div>
              
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 border border-primary/20">
                <Settings className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {user?.first_name || 'Admin'}
                </span>
              </div>
            </div>
          </header>

          {/* Main Content Area with iOS safe area */}
          <main 
            className="flex-1 overflow-auto"
            style={{ paddingBottom: 'var(--admin-safe-area-bottom, 0px)' }}
          >
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}