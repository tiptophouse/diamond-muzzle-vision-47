import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useTelegramDeepLink() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleStartParams = () => {
      try {
        // Check if we're in Telegram environment
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          
          // Get start parameter from initDataUnsafe
          const startParam = tg.initDataUnsafe?.start_parameter;
          
          if (startParam) {
            console.log('📱 Telegram start parameter detected:', startParam);
            
            // Handle different deep link patterns
            switch (startParam) {
              case 'upload-single-stone':
                console.log('🔗 Redirecting to upload page via deep link');
                navigate('/upload');
                break;
              case 'inventory':
                console.log('🔗 Redirecting to inventory page via deep link');
                navigate('/inventory');
                break;
              case 'store':
                console.log('🔗 Redirecting to store page via deep link');
                navigate('/store');
                break;
              case 'dashboard':
                console.log('🔗 Redirecting to dashboard page via deep link');
                navigate('/dashboard');
                break;
              default:
                // Handle tutorial pattern: tutorial_[telegram_id]
                if (startParam.startsWith('tutorial_')) {
                  console.log('🔗 Tutorial deep link detected');
                  navigate('/dashboard'); // Navigate to dashboard for tutorial
                }
                break;
            }
          }
          
          // Also check URL parameters for web-based deep links
          const urlParams = new URLSearchParams(window.location.search);
          const startAppParam = urlParams.get('startapp');
          
          if (startAppParam) {
            console.log('🌐 Web startapp parameter detected:', startAppParam);
            
            switch (startAppParam) {
              case 'upload-single-stone':
                console.log('🔗 Redirecting to upload page via web deep link');
                navigate('/upload');
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                break;
              case 'inventory':
                navigate('/inventory');
                window.history.replaceState({}, document.title, window.location.pathname);
                break;
              case 'store':
                navigate('/store');
                window.history.replaceState({}, document.title, window.location.pathname);
                break;
              default:
                if (startAppParam.startsWith('tutorial_')) {
                  navigate('/dashboard');
                  window.history.replaceState({}, document.title, window.location.pathname);
                }
                break;
            }
          }
        }
      } catch (error) {
        console.error('❌ Error handling deep link:', error);
      }
    };

    // Handle deep links after a short delay to ensure Telegram WebApp is ready
    const timeoutId = setTimeout(handleStartParams, 500);

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return null;
}