
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useTelegramBackButton(enabled: boolean = true) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.Telegram?.WebApp) {
      return;
    }

    const tg = window.Telegram.WebApp;
    
    const handleBackClick = () => {
      navigate(-1);
    };

    if (enabled) {
      tg.BackButton.onClick(handleBackClick);
      tg.BackButton.show();
    }

    return () => {
      tg.BackButton.hide();
    };
  }, [enabled, navigate]);
}
