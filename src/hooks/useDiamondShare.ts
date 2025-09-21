import { useCallback } from 'react';
import { formatDiamondShareText, DiamondShareUrls } from '@/utils/shareUtils';
import { useTelegramWebApp } from './useTelegramWebApp';
import { toast } from 'sonner';

export interface ShareableDiamond {
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  price: number;
  stockNumber: string;
}

/**
 * Hook for sharing diamonds with proper Telegram deep links
 * Uses public URLs that work without JWT authentication
 */
export function useDiamondShare() {
  const { webApp, hapticFeedback } = useTelegramWebApp();

  const shareDiamond = useCallback(async (diamond: ShareableDiamond) => {
    hapticFeedback.impact('medium');

    try {
      // Generate proper sharing URLs and content
      const shareData = formatDiamondShareText(diamond);
      
      console.log('🔗 DIAMOND SHARE: Generated sharing data:', {
        title: shareData.title,
        telegramUrl: shareData.telegramUrl,
        webUrl: shareData.webUrl
      });

      // Method 1: Telegram native sharing (best for Telegram environment)
      const tgWebApp = window.Telegram?.WebApp as any;
      if (tgWebApp?.switchInlineQuery) {
        try {
          // Use the web URL for external sharing, Telegram deep link stays internal
          const telegramShareText = `${shareData.text}\n\n👆 View: ${shareData.webUrl}`;
          await tgWebApp.switchInlineQuery(telegramShareText, ['users', 'groups', 'channels']);
          toast.success('Diamond shared via Telegram!');
          return { success: true, method: 'telegram' };
        } catch (error) {
          console.warn('Telegram sharing failed:', error);
        }
      }

      // Method 2: Web Share API with public URL
      if (navigator.share && navigator.canShare?.({
        title: shareData.title,
        text: shareData.text,
        url: shareData.webUrl
      })) {
        try {
          await navigator.share({
            title: shareData.title,
            text: shareData.text,
            url: shareData.webUrl,
          });
          toast.success('Diamond shared successfully!');
          return { success: true, method: 'webshare' };
        } catch (shareError) {
          if (shareError instanceof Error && shareError.name !== 'AbortError') {
            console.warn('Web Share API failed:', shareError);
          } else {
            // User cancelled - not an error
            return { success: true, method: 'cancelled' };
          }
        }
      }

      // Method 3: Clipboard fallback
      const fullShareContent = `${shareData.text}\n\n👆 View: ${shareData.webUrl}`;
      
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullShareContent);
        
        if (webApp?.showAlert) {
          webApp.showAlert('Diamond details copied! You can now paste the link in any chat.');
        } else {
          toast.success('Diamond link copied to clipboard!');
        }
        return { success: true, method: 'clipboard' };
      }

      // Final fallback: Legacy clipboard
      const textArea = document.createElement('textarea');
      textArea.value = fullShareContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast.success('Diamond link copied to clipboard!');
      return { success: true, method: 'legacy' };

    } catch (error) {
      console.error('Diamond sharing failed:', error);
      toast.error('Failed to share diamond');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [webApp, hapticFeedback]);

  const copyDiamondLink = useCallback(async (stockNumber: string) => {
    try {
      const shareUrls = formatDiamondShareText({
        carat: 0, shape: '', color: '', clarity: '', price: 0, stockNumber
      });
      
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrls.webUrl);
        toast.success('Diamond link copied!');
      } else {
        // Legacy fallback
        const textArea = document.createElement('textarea');
        textArea.value = shareUrls.webUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Diamond link copied!');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to copy diamond link:', error);
      toast.error('Failed to copy link');
      return { success: false };
    }
  }, []);

  const openInTelegram = useCallback((stockNumber: string) => {
    const shareUrls = formatDiamondShareText({
      carat: 0, shape: '', color: '', clarity: '', price: 0, stockNumber
    });
    
    // Open the Telegram deep link
    window.open(shareUrls.telegramUrl, '_blank');
    hapticFeedback.impact('light');
  }, [hapticFeedback]);

  return {
    shareDiamond,
    copyDiamondLink,
    openInTelegram
  };
}