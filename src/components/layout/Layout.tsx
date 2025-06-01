
import Sidebar from './Sidebar';
import { MobileNav } from './MobileNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEffect } from 'react';
import { useTracking } from '@/context/TrackingContext';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  const { user, isLoading, error } = useTelegramAuth();
  const { trackPageVisit } = useTracking();
  const location = useLocation();

  // Track page visits
  useEffect(() => {
    trackPageVisit(location.pathname, document.title);
  }, [location.pathname, trackPageVisit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden antialiased text-foreground">
      {isMobile ? (
        <MobileNav />
      ) : (
        <Sidebar />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
