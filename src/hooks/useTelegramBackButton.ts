import { useEffect } from 'react';
import { getTelegramWebApp } from '@/utils/telegramWebApp';

export function useTelegramBackButton(onBackClick?: () => boolean) {
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg?.BackButton) return;

    const handleBack = () => {
      if (onBackClick) {
        const shouldPreventDefault = onBackClick();
        if (shouldPreventDefault) {
          return;
        }
      }
      // Default behavior - close the app or go back
      if (tg.close) {
        tg.close();
      }
    };

    tg.BackButton.show();
    tg.BackButton.onClick(handleBack);

    return () => {
      if (tg.BackButton) {
        tg.BackButton.hide();
      }
    };
  }, [onBackClick]);
}