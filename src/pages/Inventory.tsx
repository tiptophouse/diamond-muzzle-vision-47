
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryTableLoading } from '@/components/inventory/InventoryTableLoading';
import { InventoryTableEmpty } from '@/components/inventory/InventoryTableEmpty';
import { useInventory } from '@/hooks/useInventory';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from 'sonner';

export default function Inventory() {
  const navigate = useNavigate();
  const { navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();
  const { user } = useTelegramAuth();
  const { data: inventory, isLoading, refetch } = useInventory(user?.id);

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

  // Show success/failure notifications for diamond operations
  useEffect(() => {
    const handleDiamondDeleted = (event: CustomEvent) => {
      const { success, message } = event.detail;
      if (success) {
        toast.success(message || 'Diamond deleted successfully!');
        refetch(); // Refresh the inventory
      } else {
        toast.error(message || 'Failed to delete diamond');
      }
    };

    const handleDiamondAdded = (event: CustomEvent) => {
      const { success, message } = event.detail;
      if (success) {
        toast.success(message || 'Diamond added successfully!');
        refetch(); // Refresh the inventory
      } else {
        toast.error(message || 'Failed to add diamond');
      }
    };

    window.addEventListener('diamondDeleted', handleDiamondDeleted as EventListener);
    window.addEventListener('diamondAdded', handleDiamondAdded as EventListener);
    
    return () => {
      window.removeEventListener('diamondDeleted', handleDiamondDeleted as EventListener);
      window.removeEventListener('diamondAdded', handleDiamondAdded as EventListener);
    };
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <InventoryHeader totalCount={0} onRefresh={refetch} loading={true} />
        <InventoryTableLoading />
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <InventoryHeader totalCount={0} onRefresh={refetch} />
        <InventoryTableEmpty />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <InventoryHeader 
        totalCount={inventory.length} 
        onRefresh={refetch}
        onAddDiamond={() => navigate('/upload-single-stone')}
      />
      <InventoryTable data={inventory} />
    </div>
  );
}
