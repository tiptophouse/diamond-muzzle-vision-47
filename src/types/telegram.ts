
export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface TelegramInitData {
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    photo_url?: string;
  };
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramInitData;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    header_bg_color?: string;
    accent_text_color?: string;
    section_bg_color?: string;
    section_header_text_color?: string;
    subtitle_text_color?: string;
    destructive_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  
  // Methods
  ready(): void;
  expand(): void;
  close(): void;
  sendData(data: string): void;
  switchInlineQuery(query: string, choose_chat_types?: string[]): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: string) => void): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{ id?: string; type?: string; text: string }>;
  }, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showScanQrPopup(params: {
    text?: string;
  }, callback?: (text: string) => void): void;
  closeScanQrPopup(): void;
  readTextFromClipboard(callback?: (text: string) => void): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContact(callback?: (granted: boolean) => void): void;
  invokeCustomMethod(method: string, params: any, callback?: (error: string, result: any) => void): void;
  onEvent(eventType: string, eventHandler: () => void): void;
  offEvent(eventType: string, eventHandler: () => void): void;
  setHeaderColor(color: `#${string}`): void;
  setBackgroundColor(color: `#${string}`): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  enableVerticalSwipes(): void;
  disableVerticalSwipes(): void;

  // Main Button
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }): void;
  };

  // Back Button
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };

  // Haptic Feedback
  HapticFeedback: {
    impactOccurred(style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type?: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };

  // Cloud Storage
  CloudStorage?: {
    setItem(key: string, value: string, callback?: (error: string | null, success: boolean) => void): void;
    getItem(key: string, callback: (error: string | null, value: string | null) => void): void;
    getItems(keys: string[], callback: (error: string | null, values: Record<string, string>) => void): void;
    removeItem(key: string, callback?: (error: string | null, success: boolean) => void): void;
    removeItems(keys: string[], callback?: (error: string | null, success: boolean) => void): void;
    getKeys(callback: (error: string | null, keys: string[]) => void): void;
  };

  // Accelerometer
  Accelerometer?: {
    start(params: { refresh_rate?: number }, callback?: () => void): void;
    stop(callback?: () => void): void;
    x: number;
    y: number;
    z: number;
  };

  // Device Orientation
  DeviceOrientation?: {
    start(params: { refresh_rate?: number }, callback?: () => void): void;
    stop(callback?: () => void): void;
    absolute: boolean;
    alpha: number;
    beta: number;
    gamma: number;
  };

  lockOrientation(callback?: () => void): void;
  unlockOrientation(callback?: () => void): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
