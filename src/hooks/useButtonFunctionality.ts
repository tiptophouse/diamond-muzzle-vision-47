
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { toast } from 'sonner';

export function useButtonFunctionality() {
  const navigate = useNavigate();
  const { impactOccurred, notificationOccurred, selectionChanged } = useTelegramHapticFeedback();

  const createFunctionalButton = useCallback((
    action: () => void | Promise<void>,
    options: {
      haptic?: 'light' | 'medium' | 'heavy';
      showToast?: { message: string; type?: 'success' | 'error' | 'info' };
      confirmAction?: string;
    } = {}
  ) => {
    return async () => {
      try {
        // Haptic feedback
        if (options.haptic) {
          impactOccurred(options.haptic);
        } else {
          selectionChanged();
        }

        // Confirmation dialog if needed
        if (options.confirmAction) {
          const confirmed = window.confirm(options.confirmAction);
          if (!confirmed) {
            return;
          }
        }

        // Execute the action
        await action();

        // Success feedback
        if (options.showToast) {
          if (options.showToast.type === 'error') {
            toast.error(options.showToast.message);
            notificationOccurred('error');
          } else {
            toast.success(options.showToast.message);
            notificationOccurred('success');
          }
        }

      } catch (error) {
        console.error('Button action failed:', error);
        toast.error('Action failed. Please try again.');
        notificationOccurred('error');
      }
    };
  }, [impactOccurred, notificationOccurred, selectionChanged]);

  // Pre-configured common button actions
  const navigationButton = useCallback((path: string, haptic: 'light' | 'medium' = 'light') => 
    createFunctionalButton(
      () => navigate(path),
      { haptic }
    ), [createFunctionalButton, navigate]);

  const shareButton = useCallback((content: { title: string; text: string; url?: string }) =>
    createFunctionalButton(
      async () => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const shareText = content.url 
            ? `${content.title}\n${content.text}\n${content.url}` 
            : `${content.title}\n${content.text}`;
          
          try {
            window.Telegram.WebApp.switchInlineQuery(shareText);
          } catch (error) {
            // Fallback to clipboard
            await navigator.clipboard.writeText(shareText);
            throw new Error('Shared to clipboard');
          }
        } else if (navigator.share) {
          await navigator.share(content);
        } else {
          const shareText = content.url 
            ? `${content.title}\n${content.text}\n${content.url}` 
            : `${content.title}\n${content.text}`;
          await navigator.clipboard.writeText(shareText);
          throw new Error('Link copied to clipboard');
        }
      },
      { 
        haptic: 'medium',
        showToast: { message: 'Content shared successfully!', type: 'success' }
      }
    ), [createFunctionalButton]);

  const deleteButton = useCallback((
    deleteAction: () => Promise<void>,
    itemName: string
  ) => createFunctionalButton(
    deleteAction,
    {
      haptic: 'heavy',
      confirmAction: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      showToast: { message: `${itemName} deleted successfully`, type: 'success' }
    }
  ), [createFunctionalButton]);

  return {
    createFunctionalButton,
    navigationButton,
    shareButton,
    deleteButton,
  };
}
