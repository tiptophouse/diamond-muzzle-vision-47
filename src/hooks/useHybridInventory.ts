
import { useState, useEffect, useMemo } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useEnhancedStoreData } from "./useEnhancedStoreData";
import { useSupabaseInventory } from "./useSupabaseInventory";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { toast } from "@/components/ui/use-toast";

// Extend Diamond interface to include source information
interface HybridDiamond extends Diamond {
  source?: 'external' | 'local';
}

export function useHybridInventory() {
  const { user } = useTelegramAuth();
  const isManager = user?.id === 101;
  
  // Get data from external API
  const { 
    diamonds: externalDiamonds, 
    loading: externalLoading, 
    error: externalError,
    refreshData: refreshExternal 
  } = useEnhancedStoreData();

  // Get data from local Supabase inventory
  const { 
    diamonds: localDiamonds, 
    loading: localLoading, 
    error: localError,
    addDiamond: addLocalDiamond,
    refreshInventory: refreshLocal 
  } = useSupabaseInventory();

  // Combine and deduplicate diamonds
  const combinedDiamonds = useMemo(() => {
    const allDiamonds: HybridDiamond[] = [];
    const stockNumbers = new Set<string>();

    // Add external diamonds first (they are the primary source)
    externalDiamonds.forEach(diamond => {
      if (!stockNumbers.has(diamond.stockNumber)) {
        allDiamonds.push({
          ...diamond,
          source: 'external' as const
        });
        stockNumbers.add(diamond.stockNumber);
      }
    });

    // Add local diamonds that don't exist in external data
    localDiamonds.forEach(diamond => {
      if (!stockNumbers.has(diamond.stockNumber)) {
        allDiamonds.push({
          ...diamond,
          source: 'local' as const
        });
        stockNumbers.add(diamond.stockNumber);
      }
    });

    // Filter for store visibility if not manager
    return isManager ? allDiamonds : allDiamonds.filter(d => d.store_visible);
  }, [externalDiamonds, localDiamonds, isManager]);

  const loading = externalLoading || localLoading;
  const error = externalError || localError;

  const refreshData = async () => {
    console.log('🔄 Refreshing hybrid inventory data...');
    await Promise.all([
      refreshExternal(),
      refreshLocal()
    ]);
  };

  const handleAddLocalDiamond = async (diamondData: Partial<Diamond>) => {
    try {
      // Check if stock number already exists
      const existingDiamond = combinedDiamonds.find(
        d => d.stockNumber === diamondData.stockNumber
      );
      
      if (existingDiamond) {
        toast({
          variant: "destructive",
          title: "Stock Number Exists",
          description: `A diamond with stock number ${diamondData.stockNumber} already exists.`,
        });
        return false;
      }

      const success = await addLocalDiamond(diamondData);
      if (success) {
        toast({
          title: "Diamond Added Successfully! ✨",
          description: `${diamondData.stockNumber} has been added to your local inventory.`,
        });
      }
      return success;
    } catch (error) {
      console.error('Error adding local diamond:', error);
      toast({
        variant: "destructive",
        title: "Failed to add diamond",
        description: "Please try again or contact support.",
      });
      return false;
    }
  };

  return {
    diamonds: combinedDiamonds,
    loading,
    error,
    addLocalDiamond: handleAddLocalDiamond,
    refreshData,
    stats: {
      total: combinedDiamonds.length,
      external: externalDiamonds.length,
      local: localDiamonds.length,
      visible: combinedDiamonds.filter(d => d.store_visible).length
    }
  };
}
