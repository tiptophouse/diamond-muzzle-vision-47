
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from './Layout';
import { TelegramLayout } from './TelegramLayout';
import { BottomNavigation } from './BottomNavigation';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { cn } from '@/lib/utils';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export function UnifiedLayout({ 
  children, 
  showBottomNav = true,
  className 
}: UnifiedLayoutProps) {
  const { isInitialized, webApp } = useEnhancedTelegramWebApp();
  const location = useLocation();
  
  // Check if we're in Telegram environment
  const isInTelegram = typeof window !== 'undefined' && 
    (window.Telegram?.WebApp || navigator.userAgent.includes('Telegram'));

  // Handle viewport for iPhone in Telegram
  useEffect(() => {
    if (isInTelegram && isInitialized) {
      // Set CSS custom properties for responsive design
      const updateViewport = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Handle bottom navigation spacing
        const bottomNavHeight = showBottomNav ? 80 : 0; // Approximate height including safe area
        document.documentElement.style.setProperty('--bottom-nav-height', `${bottomNavHeight}px`);
      };

      updateViewport();
      window.addEventListener('resize', updateViewport);
      window.addEventListener('orientationchange', updateViewport);

      return () => {
        window.removeEventListener('resize', updateViewport);
        window.removeEventListener('orientationchange', updateViewport);
      };
    }
  }, [isInTelegram, isInitialized, showBottomNav]);

  // Apply different layouts based on environment
  if (isInTelegram) {
    return (
      <TelegramLayout>
        <div className={cn(
          "min-h-screen bg-background flex flex-col",
          className
        )}>
          {/* Main content with bottom padding for navigation */}
          <main className={cn(
            "flex-1 overflow-x-hidden",
            showBottomNav && "pb-[calc(80px+env(safe-area-inset-bottom,0px))]"
          )}>
            {children}
          </main>
          
          {/* Bottom Navigation - only show in Telegram */}
          {showBottomNav && <BottomNavigation />}
        </div>
      </TelegramLayout>
    );
  }

  // Desktop layout with sidebar
  return (
    <Layout>
      <div className={cn(
        "min-h-screen bg-background",
        className
      )}>
        {children}
      </div>
    </Layout>
  );
}
