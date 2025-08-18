
import React, { useEffect } from 'react';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { useSecureNavigation } from '@/hooks/useSecureNavigation';

interface EnhancedTelegramLayoutProps {
  children: React.ReactNode;
}

export function EnhancedTelegramLayout({ children }: EnhancedTelegramLayoutProps) {
  const { webApp, isInitialized } = useEnhancedTelegramWebApp();
  const { isReady } = useSecureNavigation();

  useEffect(() => {
    // Apply RTL direction for Hebrew content globally
    const setGlobalRTL = () => {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'he';
      
      // Add RTL styles to body
      document.body.style.direction = 'rtl';
      document.body.style.textAlign = 'right';
      
      console.log('🔄 Applied RTL direction globally');
    };

    if (isInitialized) {
      setGlobalRTL();
    }
  }, [isInitialized]);

  // Apply Telegram theme colors and safe area
  useEffect(() => {
    if (webApp && isInitialized) {
      const root = document.documentElement;
      
      // Set CSS custom properties for Telegram theming
      root.style.setProperty('--tg-bg-color', webApp.backgroundColor);
      root.style.setProperty('--tg-text-color', '#000000');
      root.style.setProperty('--tg-safe-area-inset-top', `${webApp.safeAreaInset.top}px`);
      root.style.setProperty('--tg-safe-area-inset-bottom', `${webApp.safeAreaInset.bottom}px`);
      root.style.setProperty('--tg-viewport-height', `${webApp.viewportHeight}px`);
      
      console.log('🎨 Applied Telegram theme and safe area');
    }
  }, [webApp, isInitialized]);

  if (!isInitialized || !isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="animate-pulse text-center">
          <div className="text-lg font-semibold text-foreground">טוען...</div>
          <div className="text-sm text-muted-foreground mt-2">מכין את המערכת</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background text-foreground overflow-x-hidden"
      dir="rtl"
      style={{
        paddingTop: 'var(--tg-safe-area-inset-top, 0px)',
        paddingBottom: 'var(--tg-safe-area-inset-bottom, 0px)',
        minHeight: 'var(--tg-viewport-height, 100vh)'
      }}
    >
      <main className="container mx-auto px-4 py-6 max-w-4xl" dir="rtl">
        {children}
      </main>
    </div>
  );
}
