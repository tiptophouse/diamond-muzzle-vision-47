import { useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { useTelegramHapticFeedback } from './useTelegramHapticFeedback';
import { useToast } from './use-toast';

/**
 * Telegram Share Hook
 * Comprehensive sharing functionality for Telegram mini apps
 * 
 * Best Practices:
 * - Use shareToStory for visual content (images, videos)
 * - Use switchInlineQuery for text/link sharing to any chat
 * - Use openTelegramLink for bot/channel/group links
 * - Always provide fallback to clipboard for errors
 * - Add haptic feedback for better UX
 * - Format messages with emojis for engagement
 */

interface ShareOptions {
  text: string;
  url?: string;
  chooseChats?: ('users' | 'bots' | 'groups' | 'channels')[];
}

interface StoryOptions {
  mediaUrl: string;
  text?: string;
  widgetLink?: {
    url: string;
    name?: string;
  };
}

interface UseShareReturn {
  shareText: (options: ShareOptions) => Promise<boolean>;
  shareToStory: (options: StoryOptions) => Promise<boolean>;
  shareToChat: (text: string, chatTypes?: string[]) => Promise<boolean>;
  openTelegramLink: (link: string) => void;
  shareViaClipboard: (text: string) => Promise<boolean>;
  shareViaSystemShare: (text: string, url?: string) => Promise<boolean>;
  downloadFile: (url: string, fileName: string) => Promise<boolean>;
}

export function useTelegramShare(): UseShareReturn {
  const { webApp } = useTelegramWebApp();
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();
  const { toast } = useToast();

  const shareText = useCallback(
    async (options: ShareOptions): Promise<boolean> => {
      if (!webApp?.switchInlineQuery) {
        console.warn('switchInlineQuery not available, using fallback');
        return shareViaSystemShare(options.text, options.url);
      }

      try {
        impactOccurred('medium');
        const shareMessage = options.url 
          ? `${options.text}\n${options.url}` 
          : options.text;
        
        webApp.switchInlineQuery(shareMessage, options.chooseChats);
        
        notificationOccurred('success');
        console.log('✅ Share initiated:', shareMessage);
        return true;
      } catch (error) {
        console.error('Share failed:', error);
        notificationOccurred('error');
        return shareViaClipboard(options.text);
      }
    },
    [webApp, impactOccurred, notificationOccurred]
  );

  const shareToStory = useCallback(
    async (options: StoryOptions): Promise<boolean> => {
      if (!webApp?.shareToStory) {
        console.warn('shareToStory not available');
        toast({
          title: 'Not Available',
          description: 'Story sharing requires Telegram v8.0+',
          variant: 'destructive',
        });
        return false;
      }

      try {
        impactOccurred('medium');
        webApp.shareToStory(options.mediaUrl, {
          text: options.text,
          widget_link: options.widgetLink,
        });
        
        notificationOccurred('success');
        console.log('✅ Story share initiated');
        
        toast({
          title: '✨ Shared to Story',
          description: 'Your content has been shared to Telegram Stories',
        });
        
        return true;
      } catch (error) {
        console.error('Story share failed:', error);
        notificationOccurred('error');
        
        toast({
          title: 'Share Failed',
          description: 'Could not share to story',
          variant: 'destructive',
        });
        
        return false;
      }
    },
    [webApp, impactOccurred, notificationOccurred, toast]
  );

  const shareToChat = useCallback(
    async (text: string, chatTypes?: string[]): Promise<boolean> => {
      return shareText({ text, chooseChats: chatTypes as any });
    },
    [shareText]
  );

  const openTelegramLink = useCallback(
    (link: string) => {
      if (!webApp?.openTelegramLink) {
        console.warn('openTelegramLink not available, using openLink');
        webApp?.openLink?.(link);
        return;
      }

      impactOccurred('light');
      webApp.openTelegramLink(link);
      console.log('🔗 Opening Telegram link:', link);
    },
    [webApp, impactOccurred]
  );

  const shareViaClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        notificationOccurred('success');
        
        toast({
          title: '📋 Copied to Clipboard',
          description: 'Text has been copied',
        });
        
        console.log('✅ Copied to clipboard:', text.substring(0, 50));
        return true;
      } catch (error) {
        console.error('Clipboard copy failed:', error);
        notificationOccurred('error');
        
        toast({
          title: 'Copy Failed',
          description: 'Could not copy to clipboard',
          variant: 'destructive',
        });
        
        return false;
      }
    },
    [notificationOccurred, toast]
  );

  const shareViaSystemShare = useCallback(
    async (text: string, url?: string): Promise<boolean> => {
      if (!navigator.share) {
        console.warn('System share not available, using clipboard');
        return shareViaClipboard(text);
      }

      try {
        impactOccurred('medium');
        await navigator.share({ text, url });
        notificationOccurred('success');
        console.log('✅ System share successful');
        return true;
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('System share failed:', error);
          return shareViaClipboard(text);
        }
        return false;
      }
    },
    [impactOccurred, notificationOccurred, shareViaClipboard]
  );

  const downloadFile = useCallback(
    async (url: string, fileName: string): Promise<boolean> => {
      if (!webApp?.downloadFile) {
        console.warn('downloadFile not available, opening in new tab');
        window.open(url, '_blank');
        return false;
      }

      return new Promise((resolve) => {
        impactOccurred('medium');
        
        webApp.downloadFile({ url, file_name: fileName }, (success) => {
          if (success) {
            notificationOccurred('success');
            toast({
              title: '📥 Download Started',
              description: `Downloading ${fileName}`,
            });
            console.log('✅ Download initiated:', fileName);
          } else {
            notificationOccurred('error');
            toast({
              title: 'Download Failed',
              description: 'Could not download file',
              variant: 'destructive',
            });
            console.error('❌ Download failed:', fileName);
          }
          resolve(success);
        });
      });
    },
    [webApp, impactOccurred, notificationOccurred, toast]
  );

  return {
    shareText,
    shareToStory,
    shareToChat,
    openTelegramLink,
    shareViaClipboard,
    shareViaSystemShare,
    downloadFile,
  };
}
