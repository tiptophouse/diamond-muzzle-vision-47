import { useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { useTelegramHapticFeedback } from './useTelegramHapticFeedback';

/**
 * Telegram Native Popup Hook
 * Provides native Telegram-styled popups, alerts, and confirmations
 * 
 * Best Practices:
 * - Use showPopup for custom button layouts (up to 3 buttons)
 * - Use showAlert for simple notifications
 * - Use showConfirm for yes/no decisions
 * - Add haptic feedback for better UX
 * - Keep messages concise (under 256 characters)
 * - Use proper button types: 'default', 'ok', 'close', 'cancel', 'destructive'
 */

interface PopupButton {
  id?: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text: string;
}

interface UsePopupReturn {
  showPopup: (message: string, buttons: PopupButton[]) => Promise<string>;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string, okText?: string, cancelText?: string) => Promise<boolean>;
  showSuccess: (message: string) => Promise<void>;
  showError: (message: string) => Promise<void>;
  showWarning: (message: string) => Promise<void>;
  showDestructive: (message: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
}

export function useTelegramPopup(): UsePopupReturn {
  const { webApp } = useTelegramWebApp();
  const { notificationOccurred, impactOccurred } = useTelegramHapticFeedback();

  const showPopup = useCallback(
    async (message: string, buttons: PopupButton[]): Promise<string> => {
      if (!webApp?.showPopup) {
        console.warn('showPopup not available, using window.alert fallback');
        window.alert(message);
        return 'ok';
      }

      impactOccurred('light');

      return new Promise((resolve) => {
        webApp.showPopup(
          {
            message,
            buttons: buttons.map((btn, index) => ({
              id: btn.id || String(index),
              type: btn.type || 'default',
              text: btn.text,
            })),
          },
          (buttonId) => {
            impactOccurred('light');
            resolve(buttonId || 'close');
          }
        );
      });
    },
    [webApp, impactOccurred]
  );

  const showAlert = useCallback(
    async (message: string): Promise<void> => {
      if (!webApp?.showAlert) {
        console.warn('showAlert not available, using window.alert fallback');
        window.alert(message);
        return;
      }

      impactOccurred('light');

      return new Promise((resolve) => {
        webApp.showAlert(message, () => {
          impactOccurred('light');
          resolve();
        });
      });
    },
    [webApp, impactOccurred]
  );

  const showConfirm = useCallback(
    async (
      message: string,
      okText = 'OK',
      cancelText = 'Cancel'
    ): Promise<boolean> => {
      if (!webApp?.showConfirm) {
        console.warn('showConfirm not available, using window.confirm fallback');
        return window.confirm(message);
      }

      impactOccurred('light');

      return new Promise((resolve) => {
        webApp.showConfirm(message, (confirmed) => {
          if (confirmed) {
            impactOccurred('medium');
          } else {
            impactOccurred('light');
          }
          resolve(confirmed);
        });
      });
    },
    [webApp, impactOccurred]
  );

  const showSuccess = useCallback(
    async (message: string): Promise<void> => {
      notificationOccurred('success');
      await showAlert(`✅ ${message}`);
    },
    [showAlert, notificationOccurred]
  );

  const showError = useCallback(
    async (message: string): Promise<void> => {
      notificationOccurred('error');
      await showAlert(`❌ ${message}`);
    },
    [showAlert, notificationOccurred]
  );

  const showWarning = useCallback(
    async (message: string): Promise<void> => {
      notificationOccurred('warning');
      await showAlert(`⚠️ ${message}`);
    },
    [showAlert, notificationOccurred]
  );

  const showDestructive = useCallback(
    async (
      message: string,
      confirmText = 'Delete',
      cancelText = 'Cancel'
    ): Promise<boolean> => {
      if (!webApp?.showPopup) {
        return window.confirm(message);
      }

      impactOccurred('light');

      const result = await showPopup(message, [
        { id: 'cancel', type: 'cancel', text: cancelText },
        { id: 'confirm', type: 'destructive', text: confirmText },
      ]);

      if (result === 'confirm') {
        impactOccurred('heavy');
        return true;
      }

      return false;
    },
    [webApp, showPopup, impactOccurred]
  );

  return {
    showPopup,
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showDestructive,
  };
}
