
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { convertDiamondsToInventoryFormat } from "@/services/diamondAnalytics";
import { Diamond } from "@/components/inventory/InventoryTable";
import { getCurrentUserId } from "@/lib/api";

export function useInventoryProcessor() {
  const { toast } = useToast();
  
  const processInventoryData = (rawData: any[]): Diamond[] => {
    const userId = getCurrentUserId() || 2138564172;
    
    console.log('🔍 INVENTORY PROCESSOR: Converting', rawData.length, 'raw items for display');
    
    const convertedDiamonds = convertDiamondsToInventoryFormat(rawData, userId);
    
    console.log('🔍 INVENTORY PROCESSOR: Converted', convertedDiamonds.length, 'diamonds for display');
    
    return convertedDiamonds;
  };
  
  const showSuccessToast = (count: number) => {
    toast({
      title: `✅ SUCCESS: ${count} diamonds loaded`,
      description: `Connected to api.mazalbot.com and loaded your inventory!`,
    });
  };
  
  const showErrorToast = (error: string, title?: string) => {
    toast({
      title: title || "❌ Backend Connection Error",
      description: `Failed to connect to api.mazalbot.com: ${error}`,
      variant: "destructive",
    });
  };
  
  return {
    processInventoryData,
    showSuccessToast,
    showErrorToast,
  };
}
