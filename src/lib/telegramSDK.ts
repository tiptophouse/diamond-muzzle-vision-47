
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
  closingConfirmation,
  swipeBehavior,
  initDataUnsafe,
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

      // Initialize closing confirmation
      if (!closingConfirmation.isMounted()) {
        closingConfirmation.mount();
        closingConfirmation.enableClosingConfirmation();
      }

      // Initialize swipe behavior for better UX
      if (!swipeBehavior.isMounted()) {
        swipeBehavior.mount();
        swipeBehavior.disableVerticalSwipe();
      }

      // Get user data and start param
      const userData = initDataUnsafe.user;
      const startParam = initDataUnsafe.startParam;

      this.state = {
        isInitialized: true,
        user: userData || null,
        startParam: startParam || null,
        themeParams: themeParams.get(),
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
    themeParams.onChange(() => {
      const newTheme = themeParams.get();
      this.updateCSSThemeVariables(newTheme);
      this.state.themeParams = newTheme;
    });

    // Initial theme setup
    this.updateCSSThemeVariables(themeParams.get());
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

      mainButton.setText(text);
      
      if (options?.color) {
        mainButton.setBgColor(options.color);
      }
      if (options?.textColor) {
        mainButton.setTextColor(options.textColor);
      }

      mainButton.onClick(onClick);
      
      if (options?.isEnabled !== false) {
        mainButton.enable();
      }
      
      if (options?.isVisible !== false) {
        mainButton.show();
      }

    } catch (error) {
      console.error('❌ Failed to show main button:', error);
    }
  }

  hideMainButton() {
    try {
      if (mainButton.isMounted()) {
        mainButton.hide();
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
      
      backButton.onClick(onClick);
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
      if (!hapticFeedback.isMounted()) {
        hapticFeedback.mount();
      }
      hapticFeedback.impactOccurred(style);
    } catch (error) {
      console.error('❌ Haptic feedback failed:', error);
    }
  }

  notificationFeedback(type: 'error' | 'success' | 'warning' = 'success') {
    try {
      if (!hapticFeedback.isMounted()) {
        hapticFeedback.mount();
      }
      hapticFeedback.notificationOccurred(type);
    } catch (error) {
      console.error('❌ Notification feedback failed:', error);
    }
  }

  selectionFeedback() {
    try {
      if (!hapticFeedback.isMounted()) {
        hapticFeedback.mount();
      }
      hapticFeedback.selectionChanged();
    } catch (error) {
      console.error('❌ Selection feedback failed:', error);
    }
  }

  // Cloud Storage
  async setCloudStorage(key: string, value: string): Promise<boolean> {
    try {
      if (!cloudStorage.isMounted()) {
        cloudStorage.mount();
      }
      await cloudStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('❌ Cloud storage set failed:', error);
      return false;
    }
  }

  async getCloudStorage(key: string): Promise<string | null> {
    try {
      if (!cloudStorage.isMounted()) {
        cloudStorage.mount();
      }
      return await cloudStorage.getItem(key);
    } catch (error) {
      console.error('❌ Cloud storage get failed:', error);
      return null;
    }
  }

  // QR Scanner
  async scanQR(text?: string): Promise<string | null> {
    try {
      if (!qrScanner.isMounted()) {
        qrScanner.mount();
      }
      
      return new Promise((resolve) => {
        qrScanner.open({
          text: text || 'Scan QR Code',
          onCaptured: (data) => {
            qrScanner.close();
            resolve(data);
          }
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

  switchInlineQuery(query: string, chooseChatTypes?: string[]) {
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
      if (!invoice.isMounted()) {
        invoice.mount();
      }
      return await invoice.open(url);
    } catch (error) {
      console.error('❌ Open invoice failed:', error);
      return 'failed';
    }
  }

  // Biometry (if available)
  async requestBiometry(): Promise<boolean> {
    try {
      if (!biometry.isMounted()) {
        biometry.mount();
      }
      
      if (!biometry.isSupported()) {
        return false;
      }

      return await biometry.requestAccess();
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
        mainButton.hide();
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
