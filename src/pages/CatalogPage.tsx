
import React from 'react';
import { EnhancedStoreGrid } from '@/components/store/EnhancedStoreGrid';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';
import { useInventoryData } from '@/hooks/useInventoryData';

export default function CatalogPage() {
  // Clear any navigation buttons for store page
  useUnifiedTelegramNavigation();

  const { allDiamonds, loading, error, fetchData } = useInventoryData();

  return (
    <UnifiedLayout>
      <EnhancedStoreGrid 
        diamonds={allDiamonds}
        loading={loading}
        error={error}
        onUpdate={fetchData}
      />
    </UnifiedLayout>
  );
}
