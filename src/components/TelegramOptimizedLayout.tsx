import React, { useEffect } from 'react';
import { useTelegram } from '@/contexts/TelegramContext';
import { Layout } from '@/components/layout/Layout';

interface TelegramOptimizedLayoutProps {
  children: React.ReactNode;
}

export function TelegramOptimizedLayout({ children }: TelegramOptimizedLayoutProps) {
  const { 
    isInTelegram, 
    isLoading, 
    themeParams, 
    colorScheme,
    viewportHeight,
    hapticFeedback,
    isIOS,
    isAndroid
  } = useTelegram();
  
  // Apply Telegram theme when available
  useEffect(() => {
    if (isInTelegram && themeParams) {
      const root = document.documentElement;
      
      // Apply Telegram color scheme
      if (colorScheme) {
        root.classList.remove('light', 'dark');
        root.classList.add(colorScheme);
      }
      
      // Set viewport height for mobile
      if (viewportHeight) {
        root.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
      }
    }
  }, [isInTelegram, themeParams, colorScheme, viewportHeight]);
  
  // Add haptic feedback to buttons
  useEffect(() => {
    if (!isInTelegram) return;
    
    const handleButtonClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button') || target.getAttribute('role') === 'button') {
        hapticFeedback('impact', 'light');
      }
    };
    
    document.addEventListener('click', handleButtonClick);
    return () => document.removeEventListener('click', handleButtonClick);
  }, [isInTelegram, hapticFeedback]);
  
  // Apply platform-specific optimizations
  useEffect(() => {
    const root = document.documentElement;
    
    if (isIOS) {
      root.classList.add('platform-ios');
    } else if (isAndroid) {
      root.classList.add('platform-android');
    }
    
    if (isInTelegram) {
      root.classList.add('telegram-app');
    }
    
    return () => {
      root.classList.remove('platform-ios', 'platform-android', 'telegram-app');
    };
  }, [isIOS, isAndroid, isInTelegram]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Diamond Mazal...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Layout>
      {children}
    </Layout>
  );
}