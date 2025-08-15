
import {
  initData,
  miniApp,
  themeParams,
  viewport,
  backButton,
  mainButton,
  hapticFeedback,
  cloudStorage,
  qrScanner,
  invoice,
  biometry,
  swipeBehavior,
  retrieveLaunchParams,
  shareURL,
  switchInlineQuery,
  openTelegramLink,
  openLink,
  postEvent
} from '@telegram-apps/sdk';

interface TelegramSDKState {
  isInitialized: boolean;
  user: any;
  startParam: string | null;
  themeParams: any;
  platform: string;
  version: string;
}

class ModernTelegramSDK {
  private state: TelegramSDKState = {
    isInitialized: false,
    user: null,
    startParam: null,
    themeParams: {},
    platform: 'unknown',
    version: '1.0'
  };

  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing modern Telegram SDK...');

      // Initialize core components
      const [initDataResult] = await Promise.allSettled([
        initData.restore()
      ]);

      // Initialize mini app
      if (!miniApp.isMounted()) {
        miniApp.mount();
        miniApp.ready();
      }

      // Get launch parameters
      const launchParams = retrieveLaunchParams();
      console.log('📱 Launch params:', launchParams);

      // Set up viewport
      if (!viewport.isMounted()) {
        viewport.mount();
        viewport.expand();
      }

      // Initialize theme
      if (!themeParams.isMounted()) {
        themeParams.mount();
        this.setupThemeListener();
      }

      // Initialize swipe behavior for better UX
      if (!swipeBehavior.isMounted()) {
        swipeBehavior.mount();
        swipeBehavior.disableVertical();
      }

      // Get user data and start param from initData
      const initDataRaw = initData.raw();
      const urlParams = new URLSearchParams(initDataRaw || '');
      const userParam = urlParams.get('user');
      const startParam = urlParams.get('start_param');
      
      let userData = null;
      if (userParam) {
        try {
          userData = JSON.parse(userParam);
        } catch (error) {
          console.warn('Failed to parse user data:', error);
        }
      }

      this.state = {
        isInitialized: true,
        user: userData || null,
        startParam: startParam || null,
        themeParams: themeParams.state,
        platform: launchParams.platform || 'unknown',
        version: launchParams.version || '1.0'
      };

      console.log('✅ Modern Telegram SDK initialized:', this.state);
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Telegram SDK:', error);
      return false;
    }
  }

  private setupThemeListener() {
    // Modern theme change listener
    themeParams.on('change', () => {
      const newTheme = themeParams.state;
      this.updateCSSThemeVariables(newTheme);
      this.state.themeParams = newTheme;
    });

    // Initial theme setup
    this.updateCSSThemeVariables(themeParams.state);
  }

  private updateCSSThemeVariables(theme: any) {
    const root = document.documentElement;
    
    if (theme.bgColor) {
      root.style.setProperty('--tg-bg-color', theme.bgColor);
    }
    if (theme.textColor) {
      root.style.setProperty('--tg-text-color', theme.textColor);
    }
    if (theme.hintColor) {
      root.style.setProperty('--tg-hint-color', theme.hintColor);
    }
    if (theme.linkColor) {
      root.style.setProperty('--tg-link-color', theme.linkColor);
    }
    if (theme.buttonColor) {
      root.style.setProperty('--tg-button-color', theme.buttonColor);
    }
    if (theme.buttonTextColor) {
      root.style.setProperty('--tg-button-text-color', theme.buttonTextColor);
    }
    if (theme.secondaryBgColor) {
      root.style.setProperty('--tg-secondary-bg-color', theme.secondaryBgColor);
    }
    if (theme.headerBgColor) {
      root.style.setProperty('--tg-header-bg-color', theme.headerBgColor);
    }
    if (theme.accentTextColor) {
      root.style.setProperty('--tg-accent-text-color', theme.accentTextColor);
    }
    if (theme.sectionBgColor) {
      root.style.setProperty('--tg-section-bg-color', theme.sectionBgColor);
    }
    if (theme.sectionHeaderTextColor) {
      root.style.setProperty('--tg-section-header-text-color', theme.sectionHeaderTextColor);
    }
    if (theme.subtitleTextColor) {
      root.style.setProperty('--tg-subtitle-text-color', theme.subtitleTextColor);
    }
    if (theme.destructiveTextColor) {
      root.style.setProperty('--tg-destructive-text-color', theme.destructiveTextColor);
    }
  }

  // Main Button controls
  showMainButton(text: string, onClick: () => void, options?: { 
    color?: string; 
    textColor?: string; 
    isEnabled?: boolean;
    isVisible?: boolean;
  }) {
    try {
      if (!mainButton.isMounted()) {
        mainButton.mount();
      }

      mainButton.text = text;
      
      if (options?.color) {
        mainButton.bgColor = options.color;
      }
      if (options?.textColor) {
        mainButton.textColor = options.textColor;
      }

      mainButton.on('click', onClick);
      
      if (options?.isEnabled !== false) {
        mainButton.isEnabled = true;
      }
      
      if (options?.isVisible !== false) {
        mainButton.isVisible = true;
      }

    } catch (error) {
      console.error('❌ Failed to show main button:', error);
    }
  }

  hideMainButton() {
    try {
      if (mainButton.isMounted()) {
        mainButton.isVisible = false;
      }
    } catch (error) {
      console.error('❌ Failed to hide main button:', error);
    }
  }

  // Back Button controls
  showBackButton(onClick: () => void) {
    try {
      if (!backButton.isMounted()) {
        backButton.mount();
      }
      
      backButton.on('click', onClick);
      backButton.show();
    } catch (error) {
      console.error('❌ Failed to show back button:', error);
    }
  }

  hideBackButton() {
    try {
      if (backButton.isMounted()) {
        backButton.hide();
      }
    } catch (error) {
      console.error('❌ Failed to hide back button:', error);
    }
  }

  // Haptic Feedback
  impactFeedback(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    try {
      hapticFeedback.impactOccurred(style);
    } catch (error) {
      console.error('❌ Haptic feedback failed:', error);
    }
  }

  notificationFeedback(type: 'error' | 'success' | 'warning' = 'success') {
    try {
      hapticFeedback.notificationOccurred(type);
    } catch (error) {
      console.error('❌ Notification feedback failed:', error);
    }
  }

  selectionFeedback() {
    try {
      hapticFeedback.selectionChanged();
    } catch (error) {
      console.error('❌ Selection feedback failed:', error);
    }
  }

  // Cloud Storage
  async setCloudStorage(key: string, value: string): Promise<boolean> {
    try {
      await cloudStorage.set(key, value);
      return true;
    } catch (error) {
      console.error('❌ Cloud storage set failed:', error);
      return false;
    }
  }

  async getCloudStorage(key: string): Promise<string | null> {
    try {
      return await cloudStorage.get(key);
    } catch (error) {
      console.error('❌ Cloud storage get failed:', error);
      return null;
    }
  }

  // QR Scanner
  async scanQR(text?: string): Promise<string | null> {
    try {
      return new Promise((resolve) => {
        qrScanner.open({
          text: text || 'Scan QR Code'
        }).then((data) => {
          resolve(data);
        }).catch(() => {
          resolve(null);
        });
      });
    } catch (error) {
      console.error('❌ QR scanner failed:', error);
      return null;
    }
  }

  // Deep Link Handling
  getStartParam(): string | null {
    return this.state.startParam;
  }

  // Bridge Communication
  sendData(data: any) {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      postEvent('web_app_data_send', { data: dataString });
      console.log('📤 Data sent to bot:', data);
    } catch (error) {
      console.error('❌ Failed to send data to bot:', error);
    }
  }

  // Sharing
  shareURL(url: string, text?: string) {
    try {
      shareURL(url, text);
    } catch (error) {
      console.error('❌ Share URL failed:', error);
    }
  }

  switchInlineQuery(query: string, chooseChatTypes?: ('users' | 'bots' | 'groups' | 'channels')[]) {
    try {
      switchInlineQuery(query, chooseChatTypes);
    } catch (error) {
      console.error('❌ Switch inline query failed:', error);
    }
  }

  // Navigation
  openTelegramLink(url: string) {
    try {
      openTelegramLink(url);
    } catch (error) {
      console.error('❌ Open Telegram link failed:', error);
    }
  }

  openLink(url: string, options?: { tryInstantView?: boolean }) {
    try {
      openLink(url, options);
    } catch (error) {
      console.error('❌ Open link failed:', error);
    }
  }

  // Invoice
  async openInvoice(url: string): Promise<'paid' | 'cancelled' | 'failed' | 'pending'> {
    try {
      return await invoice.open(url, 'url');
    } catch (error) {
      console.error('❌ Open invoice failed:', error);
      return 'failed';
    }
  }

  // Biometry (if available)
  async requestBiometry(): Promise<boolean> {
    try {
      if (!biometry.isSupported()) {
        return false;
      }

      return await biometry.requestAccess('Please authenticate to continue');
    } catch (error) {
      console.error('❌ Biometry request failed:', error);
      return false;
    }
  }

  // Getters
  getState(): TelegramSDKState {
    return { ...this.state };
  }

  isInitialized(): boolean {
    return this.state.isInitialized;
  }

  getUser() {
    return this.state.user;
  }

  getInitData(): string | null {
    try {
      return initData.raw();
    } catch {
      return null;
    }
  }

  cleanup() {
    try {
      if (mainButton.isMounted()) {
        mainButton.isVisible = false;
      }
      if (backButton.isMounted()) {
        backButton.hide();
      }
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

export const telegramSDK = new ModernTelegramSDK();
export default telegramSDK;
