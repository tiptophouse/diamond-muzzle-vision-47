
import { useEffect } from 'react';

// Custom event for inventory data changes
export const INVENTORY_CHANGE_EVENT = 'inventory-data-changed';

export function useInventoryDataSync() {
  const triggerInventoryChange = () => {
    console.log('🔄 INVENTORY SYNC: Triggering inventory change event');
    window.dispatchEvent(new CustomEvent(INVENTORY_CHANGE_EVENT));
  };

  const subscribeToInventoryChanges = (callback: () => void) => {
    console.log('👂 INVENTORY SYNC: Subscribing to inventory changes');
    
    const handleInventoryChange = () => {
      console.log('📥 INVENTORY SYNC: Inventory change detected, executing callback');
      callback();
    };
    
    window.addEventListener(INVENTORY_CHANGE_EVENT, handleInventoryChange);
    
    return () => {
      console.log('🔇 INVENTORY SYNC: Unsubscribing from inventory changes');
      window.removeEventListener(INVENTORY_CHANGE_EVENT, handleInventoryChange);
    };
  };

  return { triggerInventoryChange, subscribeToInventoryChanges };
}
