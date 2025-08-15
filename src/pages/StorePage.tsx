
import React, { useState } from 'react';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { EnhancedStoreGrid } from '@/components/store/EnhancedStoreGrid';
import { EnhancedStoreHeader } from '@/components/store/EnhancedStoreHeader';
import { useEnhancedTelegramSDK } from '@/hooks/useEnhancedTelegramSDK';
import { useStoreData } from '@/hooks/useStoreData';

export default function StorePage() {
  const { performance } = useEnhancedTelegramSDK();
  const [sortBy, setSortBy] = useState('most-popular');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Get store data
  const { diamonds, loading, error, refetch } = useStoreData();

  // Optimize performance for iOS
  React.useEffect(() => {
    performance.enableSmoothing();
    performance.optimizeForIOS();
  }, [performance]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleOpenFilters = () => {
    setFiltersOpen(true);
  };

  return (
    <TelegramLayout>
      <div className="space-y-4 pb-4">
        <EnhancedStoreHeader 
          totalDiamonds={diamonds?.length || 0}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onOpenFilters={handleOpenFilters}
        />
        <EnhancedStoreGrid 
          diamonds={diamonds || []}
          loading={loading}
          error={error}
          onUpdate={refetch}
        />
      </div>
    </TelegramLayout>
  );
}
