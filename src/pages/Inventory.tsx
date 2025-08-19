
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryTableLoading } from '@/components/inventory/InventoryTableLoading';
import { InventoryTableEmpty } from '@/components/inventory/InventoryTableEmpty';
import { useInventory } from '@/hooks/useInventory';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export default function Inventory() {
  const navigate = useNavigate();
  const { navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();
  const { user } = useTelegramAuth();
  const { data: inventory, isLoading } = useInventory(user?.id);

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for inventory
    navigation.hideBackButton();
    navigation.showMainButton('Add Diamond', () => {
      haptics.medium();
      navigate('/upload-single-stone');
    }, '#059669');

    return () => {
      navigation.hideMainButton();
    };
  }, [isInitialized, navigation, haptics, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <InventoryHeader />
        <InventoryTableLoading />
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <InventoryHeader />
        <InventoryTableEmpty />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <InventoryHeader />
      <InventoryTable diamonds={inventory} />
    </div>
  );
}
