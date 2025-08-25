
import React from 'react';
import { EnhancedStoreGrid } from '@/components/store/EnhancedStoreGrid';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';

export default function CatalogPage() {
  // Clear any navigation buttons for store page
  useUnifiedTelegramNavigation();

  return (
    <UnifiedLayout>
      <EnhancedStoreGrid />
    </UnifiedLayout>
  );
}
