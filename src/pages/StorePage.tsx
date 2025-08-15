
import React from 'react';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { EnhancedStoreGrid } from '@/components/store/EnhancedStoreGrid';
import { EnhancedStoreHeader } from '@/components/store/EnhancedStoreHeader';
import { useEnhancedTelegramSDK } from '@/hooks/useEnhancedTelegramSDK';

export default function StorePage() {
  const { performance } = useEnhancedTelegramSDK();

  // Optimize performance for iOS
  React.useEffect(() => {
    performance.enableSmoothing();
    performance.optimizeForIOS();
  }, [performance]);

  return (
    <TelegramLayout>
      <div className="space-y-4 pb-4">
        <EnhancedStoreHeader />
        <EnhancedStoreGrid />
      </div>
    </TelegramLayout>
  );
}
