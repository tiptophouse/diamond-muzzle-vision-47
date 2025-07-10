import { useEffect } from 'react';
import { useTelegram } from '@/contexts/TelegramContext';

interface TelegramBackButtonProps {
  show?: boolean;
  onBack?: () => void;
}

export function TelegramBackButton({ show = true, onBack }: TelegramBackButtonProps) {
  const { showBackButton, hideBackButton, isInTelegram, hapticFeedback } = useTelegram();
  
  useEffect(() => {
    if (!isInTelegram) return;
    
    if (show) {
      const handleBack = () => {
        hapticFeedback('impact', 'light');
        if (onBack) {
          onBack();
        }
      };
      
      showBackButton(onBack ? handleBack : undefined);
    } else {
      hideBackButton();
    }
    
    return () => {
      hideBackButton();
    };
  }, [show, onBack, isInTelegram, showBackButton, hideBackButton, hapticFeedback]);
  
  // Render nothing in non-Telegram environments
  if (!isInTelegram) {
    return null;
  }
  
  return null;
}