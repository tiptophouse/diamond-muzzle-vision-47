// Optimized Telegram WebApp Layout Component
import React, { ReactNode } from 'react';
import { useTelegramViewport, useTelegramTheme } from '@/hooks/useTelegramSDK';
import { cn } from '@/lib/utils';

interface TelegramLayoutProps {
  children: ReactNode;
  className?: string;
  useSafeArea?: boolean;
  adaptiveHeight?: boolean;
}

export function TelegramLayout({
  children,
  className,
  useSafeArea = true,
  adaptiveHeight = true
}: TelegramLayoutProps) {
  const { viewportHeight, viewportStableHeight, safeAreaInset } = useTelegramViewport();
  const { colorScheme, themeParams } = useTelegramTheme();

  const layoutStyle: React.CSSProperties = {
    ...(adaptiveHeight && {
      minHeight: viewportStableHeight ? `${viewportStableHeight}px` : '100vh',
      height: viewportHeight ? `${viewportHeight}px` : '100vh'
    }),
    ...(useSafeArea && {
      paddingTop: `${safeAreaInset.top}px`,
      paddingBottom: `${safeAreaInset.bottom}px`,
      paddingLeft: `${safeAreaInset.left}px`,
      paddingRight: `${safeAreaInset.right}px`
    }),
    ...(themeParams.bg_color && {
      backgroundColor: themeParams.bg_color
    })
  };

  return (
    <div
      className={cn(
        'telegram-layout w-full overflow-x-hidden',
        // Adaptive theming
        colorScheme === 'dark' ? 'dark' : '',
        // Safe area support
        useSafeArea && 'supports-safe-area',
        // iOS optimizations
        'touch-manipulation overscroll-behavior-none',
        className
      )}
      style={layoutStyle}
    >
      {children}
    </div>
  );
}