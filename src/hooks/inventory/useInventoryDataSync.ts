
import { useEffect } from 'react';

// Custom event for inventory data changes
export const INVENTORY_CHANGE_EVENT = 'inventory-data-changed';

export function useInventoryDataSync() {
  const triggerInventoryChange = () => {
    window.dispatchEvent(new CustomEvent(INVENTORY_CHANGE_EVENT));
  };

  const subscribeToInventoryChanges = (callback: () => void) => {
    window.addEventListener(INVENTORY_CHANGE_EVENT, callback);
    return () => window.removeEventListener(INVENTORY_CHANGE_EVENT, callback);
  };

  return { triggerInventoryChange, subscribeToInventoryChanges };
}
