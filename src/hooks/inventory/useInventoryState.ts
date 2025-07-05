
import { useState } from 'react';
import { Diamond } from "@/components/inventory/InventoryTable";

export function useInventoryState() {
  const [loading, setLoading] = useState(false);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  const updateDiamonds = (newDiamonds: Diamond[]) => {
    console.log('📊 STATE: Updating diamonds:', newDiamonds.length);
    setAllDiamonds(newDiamonds);
    setDiamonds(newDiamonds);
  };
  
  const clearDiamonds = () => {
    console.log('🗑️ STATE: Clearing all diamonds');
    setAllDiamonds([]);
    setDiamonds([]);
  };
  
  const removeDiamondFromState = (diamondId: string) => {
    console.log('🗑️ STATE: Optimistically removing diamond:', diamondId);
    setAllDiamonds(prev => {
      const filtered = prev.filter(diamond => diamond.id !== diamondId);
      console.log('🗑️ STATE: Removed from allDiamonds, count:', prev.length, '->', filtered.length);
      return filtered;
    });
    setDiamonds(prev => {
      const filtered = prev.filter(diamond => diamond.id !== diamondId);
      console.log('🗑️ STATE: Removed from diamonds, count:', prev.length, '->', filtered.length);
      return filtered;
    });
  };

  const restoreDiamondToState = (diamond: Diamond) => {
    console.log('🔄 STATE: Restoring diamond to state:', diamond.id, diamond.stockNumber);
    setAllDiamonds(prev => {
      // Check if diamond already exists to avoid duplicates
      const exists = prev.find(d => d.id === diamond.id);
      if (exists) {
        console.log('🔄 STATE: Diamond already exists, not adding duplicate');
        return prev;
      }
      const restored = [...prev, diamond];
      console.log('🔄 STATE: Restored to allDiamonds, count:', prev.length, '->', restored.length);
      return restored;
    });
    setDiamonds(prev => {
      // Check if diamond already exists to avoid duplicates
      const exists = prev.find(d => d.id === diamond.id);
      if (exists) {
        console.log('🔄 STATE: Diamond already exists in diamonds, not adding duplicate');
        return prev;
      }
      const restored = [...prev, diamond];
      console.log('🔄 STATE: Restored to diamonds, count:', prev.length, '->', restored.length);
      return restored;
    });
  };
  
  return {
    loading,
    setLoading,
    diamonds,
    setDiamonds,
    allDiamonds,
    debugInfo,
    setDebugInfo,
    updateDiamonds,
    clearDiamonds,
    removeDiamondFromState,
    restoreDiamondToState,
  };
}
