
import { useState } from 'react';
import { Diamond } from "@/components/inventory/InventoryTable";

export function useInventoryState() {
  const [loading, setLoading] = useState(false);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  const updateDiamonds = (newDiamonds: Diamond[]) => {
    setAllDiamonds(newDiamonds);
    setDiamonds(newDiamonds);
  };
  
  const clearDiamonds = () => {
    setAllDiamonds([]);
    setDiamonds([]);
  };
  
  const removeDiamondFromState = (diamondId: string) => {
    // Optimistically remove diamond from state
    setAllDiamonds(prev => prev.filter(diamond => diamond.id !== diamondId));
    setDiamonds(prev => prev.filter(diamond => diamond.id !== diamondId));
  };

  const restoreDiamondToState = (diamond: Diamond) => {
    // Restore diamond to state
    setAllDiamonds(prev => [...prev, diamond]);
    setDiamonds(prev => [...prev, diamond]);
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
