
import React, { useEffect } from 'react';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { EnhancedStoreGrid } from '@/components/store/EnhancedStoreGrid';
import { useStoreData } from '@/hooks/useStoreData';
import { toast } from 'sonner';

export default function Store() {
  const { navigation, isInitialized } = useEnhancedTelegramWebApp();
  const { diamonds, loading, error, refetch } = useStoreData();

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for store - no navigation buttons needed
    navigation.hideBackButton();
    navigation.hideMainButton();

    return () => {
      // Cleanup not needed as we're hiding buttons
    };
  }, [isInitialized, navigation]);

  // Show success/failure notifications for sharing
  useEffect(() => {
    const handleShareResult = (event: CustomEvent) => {
      const { success, message } = event.detail;
      if (success) {
        toast.success(message || 'Diamond shared successfully!');
      } else {
        toast.error(message || 'Failed to share diamond');
      }
    };

    window.addEventListener('diamondShared', handleShareResult as EventListener);
    return () => {
      window.removeEventListener('diamondShared', handleShareResult as EventListener);
    };
  }, []);

  return <EnhancedStoreGrid diamonds={diamonds} loading={loading} error={error} onUpdate={refetch} />;
}
