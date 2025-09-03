import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdvancedTelegramSDK } from './useAdvancedTelegramSDK';

interface NavigationConfig {
  showBackButton?: boolean;
  backButtonAction?: () => void;
  
  showMainButton?: boolean;
  mainButtonText?: string;
  mainButtonColor?: string;
  mainButtonAction?: () => void;
  
  showSecondaryButton?: boolean;
  secondaryButtonText?: string;
  secondaryButtonPosition?: 'left' | 'right' | 'top' | 'bottom';
  secondaryButtonAction?: () => void;
  
  showSettingsButton?: boolean;
  settingsButtonAction?: () => void;
  
  enableSwipeToClose?: boolean;
}

interface EnhancedNavigationHook {
  // Button controls
  configureNavigation: (config: NavigationConfig) => void;
  
  showMainButton: (text: string, action: () => void, color?: string) => void;
  hideMainButton: () => void;
  
  showBackButton: (action?: () => void) => void;
  hideBackButton: () => void;
  
  showSecondaryButton: (text: string, action: () => void, position?: 'left' | 'right' | 'top' | 'bottom') => void;
  hideSecondaryButton: () => void;
  
  showSettingsButton: (action?: () => void) => void;
  hideSettingsButton: () => void;
  
  // Quick action buttons
  showUploadButton: () => void;
  showSearchButton: () => void;
  showFilterButton: () => void;
  showShareButton: (shareData?: any) => void;
  showContactButton: (contactData?: any) => void;
  
  // Page configurations
  configureForInventory: () => void;
  configureForDiamondDetail: (diamond?: any) => void;
  configureForUpload: () => void;
  configureForStore: () => void;
  configureForSettings: () => void;
  
  // Lifecycle
  cleanup: () => void;
}

export function useTelegramEnhancedNavigation(): EnhancedNavigationHook {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    showMainButton: tgShowMainButton, 
    hideMainButton: tgHideMainButton,
    showBackButton: tgShowBackButton,
    hideBackButton: tgHideBackButton,
    showSecondaryButton: tgShowSecondaryButton,
    hideSecondaryButton: tgHideSecondaryButton,
    showSettingsButton: tgShowSettingsButton,
    hideSettingsButton: tgHideSettingsButton,
    enableSwipeToClose,
    disableSwipeToClose,
    haptics,
    isInitialized
  } = useAdvancedTelegramSDK();
  
  const [currentConfig, setCurrentConfig] = useState<NavigationConfig>({});

  // Auto-configure based on route changes
  useEffect(() => {
    if (!isInitialized) return;

    const path = location.pathname;
    
    // Auto-configure based on current route
    if (path === '/inventory') {
      configureForInventory();
    } else if (path.startsWith('/diamond/')) {
      configureForDiamondDetail();
    } else if (path === '/upload-single-stone' || path === '/upload') {
      configureForUpload();
    } else if (path === '/catalog') {
      configureForStore();
    } else if (path === '/settings') {
      configureForSettings();
    } else {
      // Default configuration for other pages
      configureNavigation({
        showBackButton: path !== '/',
        enableSwipeToClose: true
      });
    }
  }, [location.pathname, isInitialized]);

  const configureNavigation = useCallback((config: NavigationConfig) => {
    setCurrentConfig(config);
    
    // Configure back button
    if (config.showBackButton) {
      tgShowBackButton(config.backButtonAction || (() => {
        haptics.impact('light');
        navigate(-1);
      }));
    } else {
      tgHideBackButton();
    }
    
    // Configure main button
    if (config.showMainButton && config.mainButtonText) {
      tgShowMainButton(
        config.mainButtonText, 
        config.mainButtonAction || (() => {}),
        config.mainButtonColor
      );
    } else {
      tgHideMainButton();
    }
    
    // Configure secondary button
    if (config.showSecondaryButton && config.secondaryButtonText) {
      tgShowSecondaryButton(
        config.secondaryButtonText,
        config.secondaryButtonAction || (() => {}),
        config.secondaryButtonPosition
      );
    } else {
      tgHideSecondaryButton();
    }
    
    // Configure settings button
    if (config.showSettingsButton) {
      tgShowSettingsButton(config.settingsButtonAction || (() => {
        haptics.impact('light');
        navigate('/settings');
      }));
    } else {
      tgHideSettingsButton();
    }
    
    // Configure swipe behavior
    if (config.enableSwipeToClose) {
      enableSwipeToClose();
    } else {
      disableSwipeToClose();
    }
  }, [
    navigate, haptics,
    tgShowMainButton, tgHideMainButton,
    tgShowBackButton, tgHideBackButton,
    tgShowSecondaryButton, tgHideSecondaryButton,
    tgShowSettingsButton, tgHideSettingsButton,
    enableSwipeToClose, disableSwipeToClose
  ]);

  // Individual button controls
  const showMainButton = useCallback((text: string, action: () => void, color = '#007AFF') => {
    tgShowMainButton(text, () => {
      haptics.impact('medium');
      action();
    }, color);
  }, [tgShowMainButton, haptics]);

  const hideMainButton = useCallback(() => {
    tgHideMainButton();
  }, [tgHideMainButton]);

  const showBackButton = useCallback((action?: () => void) => {
    tgShowBackButton(action || (() => {
      haptics.impact('light');
      navigate(-1);
    }));
  }, [tgShowBackButton, haptics, navigate]);

  const hideBackButton = useCallback(() => {
    tgHideBackButton();
  }, [tgHideBackButton]);

  const showSecondaryButton = useCallback((text: string, action: () => void, position: 'left' | 'right' | 'top' | 'bottom' = 'right') => {
    tgShowSecondaryButton(text, () => {
      haptics.impact('light');
      action();
    }, position);
  }, [tgShowSecondaryButton, haptics]);

  const hideSecondaryButton = useCallback(() => {
    tgHideSecondaryButton();
  }, [tgHideSecondaryButton]);

  const showSettingsButton = useCallback((action?: () => void) => {
    tgShowSettingsButton(action || (() => {
      haptics.impact('light');
      navigate('/settings');
    }));
  }, [tgShowSettingsButton, haptics, navigate]);

  const hideSettingsButton = useCallback(() => {
    tgHideSettingsButton();
  }, [tgHideSettingsButton]);

  // Quick action buttons
  const showUploadButton = useCallback(() => {
    showSecondaryButton('📤', () => {
      navigate('/upload-single-stone');
    }, 'bottom');
  }, [showSecondaryButton, navigate]);

  const showSearchButton = useCallback(() => {
    showSecondaryButton('🔍', () => {
      // Focus search input or open search modal
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 'right');
  }, [showSecondaryButton]);

  const showFilterButton = useCallback(() => {
    showSecondaryButton('⚙️', () => {
      // Open filters drawer/modal
      const filterButton = document.querySelector('[data-filter-trigger]') as HTMLElement;
      if (filterButton) {
        filterButton.click();
      }
    }, 'left');
  }, [showSecondaryButton]);

  const showShareButton = useCallback((shareData?: any) => {
    showMainButton('שתף', () => {
      // Handle sharing logic
      if (shareData?.url) {
        navigator.share?.({
          title: shareData.title || 'Check out this diamond',
          text: shareData.description || 'Amazing diamond found!',
          url: shareData.url
        });
      }
    }, '#007AFF');
  }, [showMainButton]);

  const showContactButton = useCallback((contactData?: any) => {
    showMainButton('צור קשר', () => {
      // Handle contact logic
      if (contactData?.phone) {
        window.open(`tel:${contactData.phone}`, '_self');
      } else if (contactData?.email) {
        window.open(`mailto:${contactData.email}`, '_self');
      }
    }, '#34C759');
  }, [showMainButton]);

  // Page-specific configurations
  const configureForInventory = useCallback(() => {
    configureNavigation({
      showBackButton: true,
      showSecondaryButton: true,
      secondaryButtonText: '➕',
      secondaryButtonPosition: 'bottom',
      secondaryButtonAction: () => navigate('/upload-single-stone'),
      showSettingsButton: true,
      enableSwipeToClose: true
    });
  }, [configureNavigation, navigate]);

  const configureForDiamondDetail = useCallback((diamond?: any) => {
    configureNavigation({
      showBackButton: true,
      showMainButton: true,
      mainButtonText: 'צור קשר',
      mainButtonColor: '#34C759',
      mainButtonAction: () => {
        // Handle contact action
        console.log('Contact for diamond:', diamond);
      },
      showSecondaryButton: true,
      secondaryButtonText: '🔗',
      secondaryButtonPosition: 'right',
      secondaryButtonAction: () => {
        // Handle share action
        console.log('Share diamond:', diamond);
      },
      enableSwipeToClose: true
    });
  }, [configureNavigation]);

  const configureForUpload = useCallback(() => {
    configureNavigation({
      showBackButton: true,
      showMainButton: true,
      mainButtonText: 'העלה',
      mainButtonColor: '#007AFF',
      mainButtonAction: () => {
        // Trigger form submission
        const submitButton = document.querySelector('button[type="submit"]') as HTMLElement;
        if (submitButton) {
          submitButton.click();
        }
      },
      enableSwipeToClose: false // Prevent accidental closes during upload
    });
  }, [configureNavigation]);

  const configureForStore = useCallback(() => {
    configureNavigation({
      showBackButton: true,
      showSecondaryButton: true,
      secondaryButtonText: '🔍',
      secondaryButtonPosition: 'right',
      secondaryButtonAction: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      showSettingsButton: true,
      enableSwipeToClose: true
    });
  }, [configureNavigation]);

  const configureForSettings = useCallback(() => {
    configureNavigation({
      showBackButton: true,
      enableSwipeToClose: true
    });
  }, [configureNavigation]);

  const cleanup = useCallback(() => {
    tgHideMainButton();
    tgHideBackButton();
    tgHideSecondaryButton();
    tgHideSettingsButton();
    disableSwipeToClose();
  }, [
    tgHideMainButton, 
    tgHideBackButton, 
    tgHideSecondaryButton, 
    tgHideSettingsButton, 
    disableSwipeToClose
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    configureNavigation,
    
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    showSecondaryButton,
    hideSecondaryButton,
    showSettingsButton,
    hideSettingsButton,
    
    showUploadButton,
    showSearchButton,
    showFilterButton,
    showShareButton,
    showContactButton,
    
    configureForInventory,
    configureForDiamondDetail,
    configureForUpload,
    configureForStore,
    configureForSettings,
    
    cleanup
  };
}