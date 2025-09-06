// Optimized Telegram-aware Button Component
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTelegramHaptics } from '@/hooks/useTelegramSDK';
import { cn } from '@/lib/utils';

interface TelegramOptimizedButtonProps extends React.ComponentProps<typeof Button> {
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection';
  telegramOptimized?: boolean;
}

export function TelegramOptimizedButton({
  hapticFeedback = 'selection',
  telegramOptimized = true,
  onClick,
  className,
  children,
  ...props
}: TelegramOptimizedButtonProps) {
  const { impact, notification, selection, isAvailable } = useTelegramHaptics();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger haptic feedback if available and enabled
    if (isAvailable && telegramOptimized) {
      switch (hapticFeedback) {
        case 'light':
        case 'medium':
        case 'heavy':
          impact(hapticFeedback);
          break;
        case 'success':
        case 'error':
        case 'warning':
          notification(hapticFeedback);
          break;
        case 'selection':
          selection();
          break;
      }
    }

    // Call original onClick handler
    onClick?.(event);
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        // Telegram-optimized styling
        telegramOptimized && "min-h-[44px] touch-manipulation select-none",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}