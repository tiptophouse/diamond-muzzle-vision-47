
import React, { useEffect } from 'react';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { useInventoryData } from '@/hooks/useInventoryData';

export default function Dashboard() {
  const { navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();
  const { diamonds, loading, handleRefresh } = useInventoryData();

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for dashboard
    navigation.hideBackButton();
    navigation.showMainButton('Add Diamond', () => {
      haptics.medium();
      // Navigate to add diamond
    }, '#059669');

    return () => {
      navigation.hideMainButton();
    };
  }, [isInitialized, navigation, haptics]);

  return (
    <DataDrivenDashboard 
      allDiamonds={diamonds} 
      loading={loading} 
      fetchData={handleRefresh} 
    />
  );
}
