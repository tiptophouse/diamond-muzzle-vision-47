import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';

/**
 * Hook to handle Telegram deep links for navigation
 * Supports start parameters like: tg://resolve?domain=yourbot&start=page_campaigns
 */
export function useTelegramDeepLink() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleDeepLink = () => {
      try {
        // Check if Telegram WebApp is available
        if (!window.Telegram?.WebApp) {
          return;
        }

        // Get start parameter from Telegram
        const startParam = window.Telegram.WebApp.initDataUnsafe?.start_param;
        
        if (!startParam) {
          return;
        }

        logger.telegramAction('deep_link_received', { startParam });

        // Parse the start parameter and navigate
        // Format: page_campaigns, page_dashboard, page_inventory, etc.
        if (startParam.startsWith('page_')) {
          const page = startParam.replace('page_', '');
          const routeMap: Record<string, string> = {
            'dashboard': '/dashboard',
            'campaigns': '/campaigns',
            'inventory': '/inventory',
            'store': '/store',
            'catalog': '/catalog',
            'notifications': '/notifications',
            'settings': '/settings',
            'insights': '/insights',
            'analytics': '/analytics',
            'chat': '/chat',
            'profile': '/profile',
            'upload': '/upload',
          };

          const route = routeMap[page];
          if (route) {
            logger.telegramAction('deep_link_navigating', { page, route });
            // Navigate after a short delay to ensure app is ready
            setTimeout(() => {
              navigate(route);
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
        logger.telegramAction('deep_link_error', { error: String(error) });
      }
    };

    // Handle deep link on mount
    handleDeepLink();
  }, [navigate]);
}

/**
 * Helper function to generate Telegram deep links
 * Use this in your backend or campaign messages
 */
export function generateTelegramDeepLink(botUsername: string, page: string): string {
  return `https://t.me/${botUsername}?start=page_${page}`;
}

/**
 * Helper function to generate inline button with deep link
 * Use this in Telegram bot messages
 */
export function createDeepLinkButton(text: string, botUsername: string, page: string) {
  return {
    text,
    url: generateTelegramDeepLink(botUsername, page)
  };
}
