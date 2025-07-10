import { useEffect } from 'react';
import { useTelegram } from '@/contexts/TelegramContext';

interface TelegramMainButtonProps {
  text: string;
  onClick: () => void;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  loading?: boolean;
  show?: boolean;
}

export function TelegramMainButton({
  text,
  onClick,
  color = '#2481cc',
  textColor = '#ffffff',
  disabled = false,
  loading = false,
  show = true
}: TelegramMainButtonProps) {
  const { setMainButton, hideMainButton, isInTelegram, hapticFeedback } = useTelegram();
  
  useEffect(() => {
    if (!isInTelegram || !show) {
      hideMainButton();
      return;
    }
    
    const handleClick = () => {
      hapticFeedback('impact', 'medium');
      onClick();
    };
    
    setMainButton({
      text: loading ? 'Loading...' : text,
      color,
      textColor,
      isActive: !disabled && !loading,
      isVisible: true,
      onClick: handleClick
    });
    
    return () => {
      hideMainButton();
    };
  }, [text, onClick, color, textColor, disabled, loading, show, isInTelegram, setMainButton, hideMainButton, hapticFeedback]);
  
  // Render nothing in non-Telegram environments
  if (!isInTelegram) {
    return null;
  }
  
  return null;
}