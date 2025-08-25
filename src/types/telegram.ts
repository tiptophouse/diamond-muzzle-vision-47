
// Telegram WebApp types
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready(): void;
        expand(): void;
        close(): void;
        initData: string;
        initDataUnsafe: any;
        platform: string;
        version: string;
        BackButton: {
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
        };
        MainButton: {
          show(): void;
          hide(): void;
          setText(text: string): void;
          onClick(callback: () => void): void;
          color: string;
        };
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
        viewportHeight: number;
        viewportStableHeight: number;
        setHeaderColor(color: string): void;
        setBackgroundColor(color: string): void;
        enableClosingConfirmation(): void;
        onEvent(eventType: string, callback: () => void): void;
        offEvent(eventType: string, callback: () => void): void;
      };
    };
  }
}

export {};
