import { getTelegramWebApp } from './telegramWebApp';

class NavigationManager {
  private static instance: NavigationManager;
  private backButtonHandler: (() => void) | null = null;
  private mainButtonHandler: (() => void) | null = null;
  private isBackButtonVisible = false;
  private isMainButtonVisible = false;

  static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager();
    }
    return NavigationManager.instance;
  }

  showBackButton(handler: () => void) {
    const tg = getTelegramWebApp();
    if (!tg?.BackButton) return;

    try {
      // Remove existing handler if any
      if (this.backButtonHandler) {
        tg.BackButton.offClick(this.backButtonHandler);
      }

      this.backButtonHandler = handler;
      tg.BackButton.onClick(this.backButtonHandler);
      tg.BackButton.show();
      this.isBackButtonVisible = true;
      
      console.log('✅ Back button shown with handler');
    } catch (error) {
      console.error('❌ Error showing back button:', error);
    }
  }

  hideBackButton() {
    const tg = getTelegramWebApp();
    if (!tg?.BackButton) return;

    try {
      if (this.backButtonHandler) {
        tg.BackButton.offClick(this.backButtonHandler);
        this.backButtonHandler = null;
      }
      tg.BackButton.hide();
      this.isBackButtonVisible = false;
      
      console.log('✅ Back button hidden');
    } catch (error) {
      console.error('❌ Error hiding back button:', error);
    }
  }

  showMainButton(text: string, handler: () => void) {
    const tg = getTelegramWebApp();
    if (!tg?.MainButton) return;

    try {
      // Remove existing handler if any
      if (this.mainButtonHandler) {
        tg.MainButton.offClick(this.mainButtonHandler);
      }

      this.mainButtonHandler = handler;
      tg.MainButton.setText(text);
      tg.MainButton.onClick(this.mainButtonHandler);
      tg.MainButton.show();
      this.isMainButtonVisible = true;
      
      console.log('✅ Main button shown:', text);
    } catch (error) {
      console.error('❌ Error showing main button:', error);
    }
  }

  hideMainButton() {
    const tg = getTelegramWebApp();
    if (!tg?.MainButton) return;

    try {
      if (this.mainButtonHandler) {
        tg.MainButton.offClick(this.mainButtonHandler);
        this.mainButtonHandler = null;
      }
      tg.MainButton.hide();
      this.isMainButtonVisible = false;
      
      console.log('✅ Main button hidden');
    } catch (error) {
      console.error('❌ Error hiding main button:', error);
    }
  }

  cleanup() {
    this.hideBackButton();
    this.hideMainButton();
  }

  getIsBackButtonVisible(): boolean {
    return this.isBackButtonVisible;
  }

  getIsMainButtonVisible(): boolean {
    return this.isMainButtonVisible;
  }
}

export const navigationManager = NavigationManager.getInstance();
