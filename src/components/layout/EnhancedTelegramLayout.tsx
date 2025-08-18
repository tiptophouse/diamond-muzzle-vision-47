
import React, { useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { cn } from '@/lib/utils';

interface EnhancedTelegramLayoutProps {
  children: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  mainButtonText?: string;
  mainButtonColor?: string;
  onMainButtonClick?: () => void;
  enableScrolling?: boolean;
}

export function EnhancedTelegramLayout({ 
  children, 
  className,
  showBackButton = false,
  onBackClick,
  mainButtonText,
  mainButtonColor = '#007AFF',
  onMainButtonClick,
  enableScrolling = true
}: EnhancedTelegramLayoutProps) {
  const { 
    webApp, 
    isReady, 
    backButton, 
    mainButton, 
    hapticFeedback,
    isIOS,
    safeAreaInset 
  } = useTelegramWebApp();

  // Configure Telegram navigation
  useEffect(() => {
    if (!isReady || !webApp) return;

    // Configure back button
    if (showBackButton && onBackClick) {
      backButton.show(() => {
        hapticFeedback.impact('light');
        onBackClick();
      });
    } else {
      backButton.hide();
    }

    // Configure main button
    if (mainButtonText && onMainButtonClick) {
      mainButton.show(mainButtonText, () => {
        hapticFeedback.impact('medium');
        onMainButtonClick();
      }, mainButtonColor);
    } else {
      mainButton.hide();
    }

    // Cleanup on unmount
    return () => {
      backButton.hide();
      mainButton.hide();
    };
  }, [isReady, webApp, showBackButton, onBackClick, mainButtonText, onMainButtonClick, mainButtonColor, backButton, mainButton, hapticFeedback]);

  // Handle iPhone viewport changes
  useEffect(() => {
    if (!isIOS) return;

    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        handleResize();
        hapticFeedback.selection();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial call
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isIOS, hapticFeedback]);

  if (!isReady) {
    return (
      <div className="telegram-container bg-background">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "telegram-container bg-background text-foreground",
      className
    )}>
      {/* Safe area top spacer for iPhone */}
      {isIOS && safeAreaInset.top > 0 && (
        <div 
          className="bg-background flex-shrink-0"
          style={{ height: `${safeAreaInset.top}px` }}
        />
      )}
      
      {/* Main content area */}
      <div className={cn(
        "flex-1 relative",
        enableScrolling ? "telegram-scrollable" : "overflow-hidden"
      )}>
        {children}
      </div>
      
      {/* Safe area bottom spacer for iPhone */}
      {isIOS && safeAreaInset.bottom > 0 && (
        <div 
          className="bg-background flex-shrink-0"
          style={{ height: `${safeAreaInset.bottom}px` }}
        />
      )}
    </div>
  );
}
