import React, { ReactNode, useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useOptimizedTelegramAuthContext } from '@/context/OptimizedTelegramAuthContext';

interface EnhancedTelegramLayoutProps {
  children: ReactNode;
}

export function EnhancedTelegramLayout({ children }: EnhancedTelegramLayoutProps) {
  const { webApp, hapticFeedback } = useTelegramWebApp();
  const { user, isAuthenticated } = useOptimizedTelegramAuthContext();

  useEffect(() => {
    if (webApp) {
      webApp.setBackgroundColor('#f0f2f5');
      webApp.setHeaderColor('#ffffff');
    }
  }, [webApp]);

  useEffect(() => {
    if (isAuthenticated && user) {
      hapticFeedback.notification('success');
    }
  }, [isAuthenticated, user, hapticFeedback]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4">
        <Header />
        <main className="container mx-auto mt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
