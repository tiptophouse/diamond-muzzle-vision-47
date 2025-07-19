
import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Initialize enhanced user tracking
  useEnhancedUserTracking();
  
  // Initialize Telegram WebApp
  useTelegramWebApp();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
