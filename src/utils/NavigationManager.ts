
import WebApp from '@twa-dev/sdk';

interface NavigationRequest {
  id: string;
  priority: number;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showMainButton?: boolean;
  mainButtonText?: string;
  mainButtonColor?: string;
  onMainClick?: () => void;
}

class NavigationManager {
  private static instance: NavigationManager;
  private currentRequest: NavigationRequest | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private isUpdating = false;
  private readonly isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  private readonly debounceDelay = this.isIOS ? 300 : 100; // Longer delay for iOS

  private constructor() {
    console.log('🚀 NavigationManager initialized');
  }

  static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager();
    }
    return NavigationManager.instance;
  }

  requestNavigation(request: NavigationRequest): void {
    console.log('📱 Navigation requested:', request.id);
    
    // Higher priority requests override lower ones
    if (this.currentRequest && request.priority <= this.currentRequest.priority) {
      console.log('📱 Request ignored - lower priority');
      return;
    }

    this.currentRequest = request;
    this.debouncedUpdate();
  }

  releaseNavigation(id: string): void {
    if (this.currentRequest?.id === id) {
      console.log('📱 Navigation released:', id);
      this.currentRequest = null;
      this.debouncedUpdate();
    }
  }

  private debouncedUpdate(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.updateNavigation();
    }, this.debounceDelay);
  }

  private updateNavigation(): void {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      // Clear existing handlers first
      this.clearNavigation();

      if (this.currentRequest) {
        // Configure back button
        if (this.currentRequest.showBackButton && this.currentRequest.onBackClick) {
          WebApp.BackButton.onClick(this.currentRequest.onBackClick);
          WebApp.BackButton.show();
        }

        // Configure main button
        if (this.currentRequest.showMainButton && this.currentRequest.mainButtonText) {
          WebApp.MainButton.setText(this.currentRequest.mainButtonText);
          if (this.currentRequest.mainButtonColor) {
            WebApp.MainButton.color = this.currentRequest.mainButtonColor as `#${string}`;
          }
          if (this.currentRequest.onMainClick) {
            WebApp.MainButton.onClick(this.currentRequest.onMainClick);
          }
          WebApp.MainButton.show();
        }
      }

      console.log('📱 Navigation updated successfully');
    } catch (error) {
      console.error('❌ Navigation update failed:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  private clearNavigation(): void {
    try {
      // Clear back button
      WebApp.BackButton.hide();
      if (WebApp.BackButton.offClick) {
        WebApp.BackButton.offClick();
      }

      // Clear main button
      WebApp.MainButton.hide();
      if (WebApp.MainButton.offClick) {
        WebApp.MainButton.offClick();
      }
    } catch (error) {
      console.warn('⚠️ Navigation cleanup warning:', error);
    }
  }

  cleanup(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.clearNavigation();
    this.currentRequest = null;
  }
}

export const navigationManager = NavigationManager.getInstance();
