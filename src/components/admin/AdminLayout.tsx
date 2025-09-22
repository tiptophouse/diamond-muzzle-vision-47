import { ReactNode } from 'react';
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

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { user } = useTelegramAuth();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <SidebarInset className="flex-1">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="flex items-center gap-4 px-6">
              <SidebarTrigger className="h-8 w-8 hover:bg-sidebar-accent" />
              
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

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}