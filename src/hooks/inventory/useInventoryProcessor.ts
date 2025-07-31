
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
    if (rawData.length > 0 && rawData[0].id && rawData[0].stockNumber) {
      console.log('🔍 INVENTORY PROCESSOR: Data already in Diamond format');
      // Ensure all required fields are present
      return rawData.map((diamond: any) => ({
        ...diamond,
        store_visible: diamond.store_visible !== undefined ? diamond.store_visible : true,
        imageUrl: diamond.imageUrl || diamond.picture,
        v360Url: diamond.v360Url,
        gem360Url: diamond.gem360Url,
        videoUrl: diamond.videoUrl,
        certificateImageUrl: diamond.certificateImageUrl,
        giaReportPdf: diamond.giaReportPdf,
      })) as Diamond[];
    }
    
    // Otherwise convert from raw API format
    const convertedDiamonds = convertDiamondsToInventoryFormat(rawData, userId);
    
    console.log('🔍 INVENTORY PROCESSOR: Converted', convertedDiamonds.length, 'diamonds for display');
    
    return convertedDiamonds;
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
