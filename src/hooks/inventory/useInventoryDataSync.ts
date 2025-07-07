
import { useEffect } from 'react';

// Custom event for inventory data changes
export const INVENTORY_CHANGE_EVENT = 'inventory-data-changed';

export function useInventoryDataSync() {
  const triggerInventoryChange = () => {
    console.log('🔄 SYNC: Triggering inventory change event...');
    window.dispatchEvent(new CustomEvent(INVENTORY_CHANGE_EVENT));
    console.log('✅ SYNC: Inventory change event dispatched');
  };

  const subscribeToInventoryChanges = (callback: () => void) => {
    console.log('👂 SYNC: Subscribing to inventory changes...');
    
    const wrappedCallback = () => {
      console.log('🔔 SYNC: Inventory change event received, executing callback...');
      callback();
      console.log('✅ SYNC: Callback executed');
    };
    
    window.addEventListener(INVENTORY_CHANGE_EVENT, wrappedCallback);
    console.log('✅ SYNC: Event listener attached');
    
    return () => {
      console.log('🗑️ SYNC: Removing inventory change listener...');
      window.removeEventListener(INVENTORY_CHANGE_EVENT, wrappedCallback);
    };
  };

  return { triggerInventoryChange, subscribeToInventoryChanges };
}
