
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { convertDiamondsToInventoryFormat } from "@/services/diamondAnalytics";
import { Diamond } from "@/components/inventory/InventoryTable";
import { getCurrentUserId } from "@/lib/api";

export function useInventoryProcessor() {
  const { toast } = useToast();
  
  const processInventoryData = (rawData: any[]): Diamond[] => {
    const userId = getCurrentUserId() || 2138564172;
    
    console.log('🔍 INVENTORY PROCESSOR: Converting', rawData.length, 'items for display');
    
    // Check if this is already processed Diamond data (from mock service)
    if (rawData.length > 0 && rawData[0].id && rawData[0].stockNumber && rawData[0].store_visible !== undefined) {
      console.log('🔍 INVENTORY PROCESSOR: Data already in Diamond format');
      return rawData as Diamond[];
    }
    
    // Otherwise convert from raw API format
    const convertedDiamonds = convertDiamondsToInventoryFormat(rawData, userId);
    
    // Ensure all required properties are present
    const processedDiamonds: Diamond[] = convertedDiamonds.map(diamond => ({
      ...diamond,
      store_visible: diamond.store_visible ?? true,
      gem360Url: diamond.gem360Url || diamond.certificateUrl?.includes('gem360') ? diamond.certificateUrl : undefined
    }));
    
    console.log('🔍 INVENTORY PROCESSOR: Converted', processedDiamonds.length, 'diamonds for display');
    
    return processedDiamonds;
  };
  
  const showSuccessToast = (count: number) => {
    const isMockData = count === 5; // Our mock service returns exactly 5 diamonds
    
    toast({
      title: `✅ ${count} diamonds loaded`,
      description: isMockData ? 
        "Sample diamonds loaded. Connect your FastAPI server for real inventory." :
        `Successfully loaded your inventory from the backend!`,
    });
  };
  
  const showErrorToast = (error: string, title?: string) => {
    toast({
      title: title || "⚠️ Loading Issue", 
      description: `Using sample data. ${error}`,
      variant: "destructive",
    });
  };
  
  return {
    processInventoryData,
    showSuccessToast,
    showErrorToast,
  };
}
