
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  phone_number?: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  safeAreaInset?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  headerColor?: string;
  backgroundColor?: string;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  disableVerticalSwipes?: () => void;
  enableVerticalSwipes?: () => void;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  Accelerometer?: {
    start: (config?: { refresh_rate?: number }) => void;
    stop: () => void;
    isStarted: boolean;
  };
  DeviceOrientation?: {
    start: (config?: { refresh_rate?: number }) => void;
    stop: () => void;
    isStarted: boolean;
  };
  Gyroscope?: {
    start: (config?: { refresh_rate?: number }) => void;
    stop: () => void;
    isStarted: boolean;
  };
  lockOrientation?: (orientation: 'portrait' | 'landscape') => void;
  unlockOrientation?: () => void;
  onEvent?: (eventType: string, callback: () => void) => void;
  offEvent?: (eventType: string, callback: () => void) => void;
  sendData?: (data: string) => void;
  switchInlineQuery?: (query: string, choose_chat_types?: string[]) => void;
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink?: (url: string) => void;
  showPopup?: (params: { message: string; buttons?: Array<{ type?: string; text: string }> }, callback?: (button_id: string) => void) => void;
  showAlert?: (message: string, callback?: () => void) => void;
  showConfirm?: (message: string, callback?: (confirmed: boolean) => void) => void;
  
  // SDK 2.0 Features (Bot API 8.0+)
  isFullscreen?: boolean;
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
  addToHomeScreen?: () => void;
  checkHomeScreenStatus?: (callback: (status: 'unsupported' | 'unknown' | 'added' | 'missed') => void) => void;
  
  SettingsButton?: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: () => void;
    show: () => void;
    hide: () => void;
  };
  
  CloudStorage?: {
    setItem: (key: string, value: string, callback?: (error: Error | null) => void) => void;
    getItem: (key: string, callback: (error: Error | null, value?: string) => void) => void;
    getItems: (keys: string[], callback: (error: Error | null, values?: Record<string, string>) => void) => void;
    removeItem: (key: string, callback?: (error: Error | null) => void) => void;
    removeItems: (keys: string[], callback?: (error: Error | null) => void) => void;
    getKeys: (callback: (error: Error | null, keys?: string[]) => void) => void;
  };
  
  BiometricManager?: {
    isInited: boolean;
    isBiometricAvailable: boolean;
    biometricType: 'finger' | 'face' | 'unknown';
    isAccessRequested: boolean;
    isAccessGranted: boolean;
    isBiometricTokenSaved: boolean;
    deviceId: string;
    init: (callback?: () => void) => void;
    requestAccess: (params: { reason?: string }, callback?: (granted: boolean) => void) => void;
    authenticate: (params: { reason?: string }, callback?: (success: boolean, token?: string) => void) => void;
    updateBiometricToken: (token: string, callback?: (success: boolean) => void) => void;
    openSettings: () => void;
  };
  
  LocationManager?: {
    isInited: boolean;
    isLocationAvailable: boolean;
    isAccessRequested: boolean;
    isAccessGranted: boolean;
    init: (callback?: () => void) => void;
    getLocation: (callback: (location: { latitude: number; longitude: number } | null) => void) => void;
    openSettings: () => void;
  };
  
  shareToStory?: (media_url: string, params?: { text?: string; widget_link?: { url: string; name?: string } }) => void;
  setEmojiStatus?: (custom_emoji_id: string, params?: { duration?: number }, callback?: (success: boolean) => void) => void;
  downloadFile?: (params: { url: string; file_name: string }, callback?: (success: boolean) => void) => void;
}
