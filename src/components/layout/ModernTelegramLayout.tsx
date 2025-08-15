
import React, { useEffect } from 'react';
import { useModernTelegramSDK } from '@/hooks/useModernTelegramSDK';

interface ModernTelegramLayoutProps {
  children: React.ReactNode;
}

export function ModernTelegramLayout({ children }: ModernTelegramLayoutProps) {
  const { isInitialized, isLoading, themeParams, platform } = useModernTelegramSDK();

  useEffect(() => {
    // Set up iOS safe area and viewport fixes
    const setupIOSFixes = () => {
      if (platform === 'ios') {
        const root = document.documentElement;
        
        // iOS safe area support
        root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
        root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
        root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
        root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
        
        // iOS viewport height fix
        const setVH = () => {
          const vh = window.innerHeight * 0.01;
          root.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);
        
        return () => {
          window.removeEventListener('resize', setVH);
          window.removeEventListener('orientationchange', setVH);
        };
      }
    };

    const cleanup = setupIOSFixes();
    return cleanup;
  }, [platform]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background text-foreground"
      style={{
        paddingTop: 'var(--safe-area-inset-top, 0px)',
        paddingRight: 'var(--safe-area-inset-right, 0px)',
        paddingBottom: 'var(--safe-area-inset-bottom, 0px)',
        paddingLeft: 'var(--safe-area-inset-left, 0px)',
        minHeight: 'calc(var(--vh, 1vh) * 100)'
      }}
    >
      {children}
    </div>
  );
}
