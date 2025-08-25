
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
        themeParams?: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        Accelerometer?: {
          start(options?: { refresh_rate?: number }): void;
          stop(): void;
          isStarted: boolean;
        };
        DeviceOrientation?: {
          start(options?: { refresh_rate?: number }): void;
          stop(): void;
        };
        lockOrientation?(orientation: 'portrait' | 'landscape'): void;
        unlockOrientation?(): void;
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
  start_param?: string;
}

export interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  initData: string;
  initDataUnsafe: TelegramInitData;
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
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  Accelerometer?: {
    start(options?: { refresh_rate?: number }): void;
    stop(): void;
    isStarted: boolean;
  };
  DeviceOrientation?: {
    start(options?: { refresh_rate?: number }): void;
    stop(): void;
  };
  lockOrientation?(orientation: 'portrait' | 'landscape'): void;
  unlockOrientation?(): void;
}

export {};
