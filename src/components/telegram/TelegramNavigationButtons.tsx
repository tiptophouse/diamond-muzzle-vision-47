/**
 * Telegram Navigation Buttons Component
 * Leverages MainButton, SecondaryButton, BackButton, and BottomBar
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTelegramAdvanced } from '@/hooks/useTelegramAdvanced';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';

interface TelegramNavigationButtonsProps {
  // Main Button
  mainButton?: {
    text: string;
    onClick: () => void;
    show?: boolean;
    loading?: boolean;
    disabled?: boolean;
    color?: string;
    textColor?: string;
  };
  
  // Secondary Button (Telegram 7.0+)
  secondaryButton?: {
    text: string;
    onClick: () => void;
    show?: boolean;
    loading?: boolean;
    disabled?: boolean;
    color?: string;
    textColor?: string;
    position?: 'left' | 'right' | 'top' | 'bottom';
    hasShineEffect?: boolean;
  };
  
  // Back Button
  showBackButton?: boolean;
  onBackClick?: () => void;
  
  // Bottom Bar color
  bottomBarColor?: string;
  showBottomBar?: boolean;
}

export function TelegramNavigationButtons({
  mainButton,
  secondaryButton,
  showBackButton = false,
  onBackClick,
  bottomBarColor,
  showBottomBar = false,
}: TelegramNavigationButtonsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { secondaryButton: tgSecondaryButton, bottomBar, features } = useTelegramAdvanced();
  const { mainButton: tgMainButton, backButton: tgBackButton, haptic } = useTelegramSDK();

  // Main Button Logic
  useEffect(() => {
    if (!mainButton) {
      tgMainButton.hide();
      return;
    }

    if (mainButton.show === false) {
      tgMainButton.hide();
      return;
    }

    // Show and configure main button
    tgMainButton.show(
      mainButton.text,
      () => {
        haptic?.impact?.('medium');
        mainButton.onClick();
      },
      {
        color: mainButton.color,
        textColor: mainButton.textColor,
      }
    );

    // Handle loading state
    if (mainButton.loading) {
      tgMainButton.showProgress();
      tgMainButton.disable();
    } else {
      tgMainButton.hideProgress();
      mainButton.disabled ? tgMainButton.disable() : tgMainButton.enable();
    }

    // Cleanup
    return () => {
      tgMainButton.hide();
    };
  }, [
    mainButton?.text,
    mainButton?.show,
    mainButton?.loading,
    mainButton?.disabled,
    mainButton?.color,
    mainButton?.textColor,
    tgMainButton,
    haptic
  ]);

  // Secondary Button Logic (Telegram 7.0+)
  useEffect(() => {
    if (!secondaryButton || !features.hasSecondaryButton) {
      tgSecondaryButton.hide();
      return;
    }

    if (secondaryButton.show === false) {
      tgSecondaryButton.hide();
      return;
    }

    // Show and configure secondary button
    tgSecondaryButton.show(
      secondaryButton.text,
      () => {
        haptic?.impact?.('light');
        secondaryButton.onClick();
      },
      {
        color: secondaryButton.color,
        textColor: secondaryButton.textColor,
        position: secondaryButton.position,
        hasShineEffect: secondaryButton.hasShineEffect,
      }
    );

    // Handle loading state
    if (secondaryButton.loading) {
      tgSecondaryButton.showProgress();
    } else {
      tgSecondaryButton.hideProgress();
    }

    // Cleanup
    return () => {
      tgSecondaryButton.hide();
    };
  }, [
    secondaryButton?.text,
    secondaryButton?.show,
    secondaryButton?.loading,
    secondaryButton?.color,
    secondaryButton?.textColor,
    secondaryButton?.position,
    secondaryButton?.hasShineEffect,
    features.hasSecondaryButton,
    tgSecondaryButton,
    haptic
  ]);

  // Back Button Logic
  useEffect(() => {
    if (!showBackButton) {
      tgBackButton.hide();
      return;
    }

    const handleBack = () => {
      haptic?.impact?.('light');
      if (onBackClick) {
        onBackClick();
      } else {
        // Default: navigate back or to home
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/');
        }
      }
    };

    tgBackButton.show(handleBack);

    // Cleanup
    return () => {
      tgBackButton.hide();
    };
  }, [showBackButton, onBackClick, navigate, tgBackButton, haptic]);

  // Bottom Bar Logic (Telegram 7.1+)
  useEffect(() => {
    if (!features.hasBottomBar) return;

    if (showBottomBar && bottomBarColor) {
      bottomBar.setColor(bottomBarColor);
      bottomBar.show();
    } else if (!showBottomBar) {
      bottomBar.hide();
    }

    return () => {
      bottomBar.hide();
    };
  }, [showBottomBar, bottomBarColor, features.hasBottomBar, bottomBar]);

  // Auto back button for detail pages
  useEffect(() => {
    const isDetailPage = location.pathname.includes('/diamond/') || 
                         location.pathname.includes('/detail/') ||
                         location.pathname.includes('/view/');
    
    if (isDetailPage && showBackButton === undefined) {
      const handleBack = () => {
        haptic?.impact?.('light');
        navigate(-1);
      };
      tgBackButton.show(handleBack);

      return () => {
        tgBackButton.hide();
      };
    }
  }, [location.pathname, showBackButton, navigate, tgBackButton, haptic]);

  // This component doesn't render anything - it only manages Telegram buttons
  return null;
}

// Preset configurations for common pages
export const NavigationPresets = {
  listPage: (onAdd: () => void) => ({
    mainButton: {
      text: 'Add New',
      onClick: onAdd,
      show: true,
      color: '#667eea',
    },
    showBackButton: false,
  }),

  detailPage: (onEdit: () => void, onDelete?: () => void) => ({
    mainButton: {
      text: 'Edit',
      onClick: onEdit,
      show: true,
      color: '#667eea',
    },
    secondaryButton: onDelete ? {
      text: 'Delete',
      onClick: onDelete,
      show: true,
      color: '#ef4444',
      position: 'right' as const,
    } : undefined,
    showBackButton: true,
  }),

  formPage: (onSave: () => void, loading = false) => ({
    mainButton: {
      text: loading ? 'Saving...' : 'Save',
      onClick: onSave,
      show: true,
      loading,
      color: '#10b981',
    },
    showBackButton: true,
  }),

  confirmPage: (onConfirm: () => void, onCancel: () => void) => ({
    mainButton: {
      text: 'Confirm',
      onClick: onConfirm,
      show: true,
      color: '#10b981',
    },
    secondaryButton: {
      text: 'Cancel',
      onClick: onCancel,
      show: true,
      color: '#6b7280',
      position: 'left' as const,
    },
    showBackButton: false,
  }),
};
