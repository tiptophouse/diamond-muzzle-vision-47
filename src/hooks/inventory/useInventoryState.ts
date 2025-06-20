
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
  };
}
