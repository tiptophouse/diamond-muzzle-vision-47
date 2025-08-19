
import React, { useEffect } from 'react';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { EnhancedStoreGrid } from '@/components/store/EnhancedStoreGrid';

export default function Store() {
  const { navigation, isInitialized } = useEnhancedTelegramWebApp();

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for store - no navigation buttons needed
    navigation.hideBackButton();
    navigation.hideMainButton();

    return () => {
      // Cleanup not needed as we're hiding buttons
    };
  }, [isInitialized, navigation]);

  return <EnhancedStoreGrid />;
}
