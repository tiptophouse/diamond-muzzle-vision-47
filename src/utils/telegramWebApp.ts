// Complete Telegram WebApp API implementation following official documentation
// https://core.telegram.org/bots/webapps

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

export interface TelegramChat {
  id: number;
  type: 'group' | 'supergroup' | 'channel';
  title: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: TelegramChat;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export interface ThemeParams {
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
}

export interface MainButton {
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
  setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
}

export interface BackButton {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
}

export interface SettingsButton {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
}

export interface HapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

export interface CloudStorage {
  setItem: (key: string, value: string, callback?: (error: string | null, result?: boolean) => void) => void;
  getItem: (key: string, callback: (error: string | null, result?: string) => void) => void;
  getItems: (keys: string[], callback: (error: string | null, result?: Record<string, string>) => void) => void;
  removeItem: (key: string, callback?: (error: string | null, result?: boolean) => void) => void;
  removeItems: (keys: string[], callback?: (error: string | null, result?: boolean) => void) => void;
  getKeys: (callback: (error: string | null, result?: string[]) => void) => void;
}

export interface BiometricManager {
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
  updateBiometricToken: (token: string, callback?: (updated: boolean) => void) => void;
  openSettings: () => void;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramInitData;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: BackButton;
  MainButton: MainButton;
  SettingsButton: SettingsButton;
  HapticFeedback: HapticFeedback;
  CloudStorage: CloudStorage;
  BiometricManager: BiometricManager;
  
  // Methods
  isVersionAtLeast: (version: string) => boolean;
  onEvent: (eventType: string, eventHandler: () => void) => void;
  offEvent: (eventType: string, eventHandler: () => void) => void;
  sendData: (data: string) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text: string }> }, callback?: (button_id: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: { text?: string }, callback?: (text: string) => void) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContact: (callback?: (granted: boolean, contact?: any) => void) => void;
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !!(
    window.Telegram?.WebApp && 
    typeof window.Telegram.WebApp === 'object'
  );
}

// Legacy alias for backward compatibility
export const isTelegramWebAppEnvironment = isTelegramWebApp;

export function getTelegramWebApp(): TelegramWebApp | null {
  if (!isTelegramWebApp()) {
    return null;
  }
  
  return window.Telegram!.WebApp;
}

export function parseTelegramInitData(initData: string): TelegramInitData | null {
  try {
    if (!initData) return null;
    
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    const chatParam = urlParams.get('chat');
    const receiverParam = urlParams.get('receiver');
    
    const result: TelegramInitData = {
      query_id: urlParams.get('query_id') || undefined,
      chat_type: urlParams.get('chat_type') || undefined,
      chat_instance: urlParams.get('chat_instance') || undefined,
      start_param: urlParams.get('start_param') || undefined,
      can_send_after: urlParams.get('can_send_after') ? parseInt(urlParams.get('can_send_after')!) : undefined,
      auth_date: parseInt(urlParams.get('auth_date') || '0'),
      hash: urlParams.get('hash') || ''
    };
    
    if (userParam) {
      result.user = JSON.parse(decodeURIComponent(userParam));
    }
    
    if (chatParam) {
      result.chat = JSON.parse(decodeURIComponent(chatParam));
    }
    
    if (receiverParam) {
      result.receiver = JSON.parse(decodeURIComponent(receiverParam));
    }
    
    return result;
  } catch (error) {
    console.error('Failed to parse Telegram initData:', error);
    return null;
  }
}

export function validateTelegramInitData(initData: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    
    if (!authDate || !hash) {
      return false;
    }
    
    // Check if the data is not too old (within 24 hours as per Telegram docs)
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return (now - authDateTime) <= maxAge;
  } catch (error) {
    console.error('Failed to validate Telegram initData:', error);
    return false;
  }
}

export function applyTelegramTheme(themeParams: ThemeParams): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (themeParams.bg_color) {
    root.style.setProperty('--tg-bg-color', themeParams.bg_color);
    document.body.style.backgroundColor = themeParams.bg_color;
  }
  
  if (themeParams.text_color) {
    root.style.setProperty('--tg-text-color', themeParams.text_color);
  }
  
  if (themeParams.hint_color) {
    root.style.setProperty('--tg-hint-color', themeParams.hint_color);
  }
  
  if (themeParams.link_color) {
    root.style.setProperty('--tg-link-color', themeParams.link_color);
  }
  
  if (themeParams.button_color) {
    root.style.setProperty('--tg-button-color', themeParams.button_color);
  }
  
  if (themeParams.button_text_color) {
    root.style.setProperty('--tg-button-text-color', themeParams.button_text_color);
  }
  
  if (themeParams.secondary_bg_color) {
    root.style.setProperty('--tg-secondary-bg-color', themeParams.secondary_bg_color);
  }
  
  if (themeParams.header_bg_color) {
    root.style.setProperty('--tg-header-bg-color', themeParams.header_bg_color);
  }
  
  if (themeParams.accent_text_color) {
    root.style.setProperty('--tg-accent-text-color', themeParams.accent_text_color);
  }
  
  if (themeParams.section_bg_color) {
    root.style.setProperty('--tg-section-bg-color', themeParams.section_bg_color);
  }
  
  if (themeParams.section_header_text_color) {
    root.style.setProperty('--tg-section-header-text-color', themeParams.section_header_text_color);
  }
  
  if (themeParams.subtitle_text_color) {
    root.style.setProperty('--tg-subtitle-text-color', themeParams.subtitle_text_color);
  }
  
  if (themeParams.destructive_text_color) {
    root.style.setProperty('--tg-destructive-text-color', themeParams.destructive_text_color);
  }
}

export function setViewportHeight(height: number): void {
  if (typeof document === 'undefined') return;
  
  document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
}

export async function initializeTelegramWebApp(): Promise<{
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  initData: TelegramInitData | null;
  isInTelegram: boolean;
}> {
  return new Promise((resolve) => {
    if (!isTelegramWebApp()) {
      resolve({
        webApp: null,
        user: null,
        initData: null,
        isInTelegram: false
      });
      return;
    }
    
    try {
      const webApp = getTelegramWebApp();
      if (!webApp) {
        resolve({
          webApp: null,
          user: null,
          initData: null,
          isInTelegram: false
        });
        return;
      }
      
      // Initialize WebApp
      webApp.ready();
      webApp.expand();
      
      // Apply theme
      applyTelegramTheme(webApp.themeParams);
      
      // Set viewport height
      setViewportHeight(webApp.viewportStableHeight || webApp.viewportHeight);
      
      // Parse init data
      const initData = parseTelegramInitData(webApp.initData);
      const user = initData?.user || webApp.initDataUnsafe?.user || null;
      
      // Set up viewport height listener
      webApp.onEvent('viewportChanged', () => {
        setViewportHeight(webApp.viewportStableHeight || webApp.viewportHeight);
      });
      
      // Set up theme change listener
      webApp.onEvent('themeChanged', () => {
        applyTelegramTheme(webApp.themeParams);
      });
      
      resolve({
        webApp,
        user,
        initData,
        isInTelegram: true
      });
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error);
      resolve({
        webApp: null,
        user: null,
        initData: null,
        isInTelegram: false
      });
    }
  });
}

// Utility functions for better UX
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

export function setupIOSOptimizations(): void {
  if (!isIOS() || typeof document === 'undefined') return;
  
  // Prevent zoom on input focus
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    );
  }
  
  // Fix 100vh on iOS
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
}