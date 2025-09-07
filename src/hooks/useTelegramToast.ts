import { toast } from 'sonner';
import { useTelegramHaptics } from '@/hooks/useTelegramSDK';

export function useTelegramToast() {
  const { notification, impact, isAvailable } = useTelegramHaptics();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Show visual toast
    const toastConfig = {
      duration: type === 'error' ? 5000 : 3000,
      position: 'top-center' as const,
      style: {
        background: 'var(--card)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
        fontSize: '14px',
        padding: '12px 16px',
        borderRadius: '8px',
        maxWidth: '90vw',
        wordBreak: 'break-word' as const,
      }
    };

    switch (type) {
      case 'success':
        toast.success(message, toastConfig);
        break;
      case 'error':
        toast.error(message, toastConfig);
        break;
      default:
        toast.info(message, toastConfig);
    }

    // Add haptic feedback if available
    if (isAvailable) {
      try {
        switch (type) {
          case 'success':
            notification('success');
            break;
          case 'error':
            notification('error');
            break;
          default:
            impact('light');
        }
      } catch (e) {
        console.warn('Haptic feedback not available:', e);
      }
    }
  };

  return {
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  };
}