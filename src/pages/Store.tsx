
import React from 'react';
import { EnhancedStoreGrid } from '@/components/store/EnhancedStoreGrid';
import { EnhancedStoreHeader } from '@/components/store/EnhancedStoreHeader';
import { FloatingShareButton } from '@/components/store/FloatingShareButton';
import { MobilePullToRefresh } from '@/components/mobile/MobilePullToRefresh';

export default function Store() {
  const handleRefresh = async () => {
    // Refresh store data
    window.location.reload();
  };

  return (
    <MobilePullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-background">
        <EnhancedStoreHeader />
        <EnhancedStoreGrid />
        <FloatingShareButton />
      </div>
    </MobilePullToRefresh>
  );
}
