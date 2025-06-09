
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useEnhancedCsvProcessor, InventoryItem } from "./useEnhancedCsvProcessor";

interface UploadResult {
  success: boolean;
  message: string;
  itemsProcessed?: number;
  errors?: string[];
}

export function useDirectUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const { user } = useTelegramAuth();
  const { processCSV } = useEnhancedCsvProcessor();

  const handleUpload = async (file: File) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to upload inventory files.",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      console.log('🔄 Starting CSV processing...');
      
      // Process the CSV file
      const inventoryItems = await processCSV(file);
      
      if (!inventoryItems || inventoryItems.length === 0) {
        throw new Error('No valid items found in the CSV file');
      }

      console.log(`📊 Processing ${inventoryItems.length} items...`);
      setProgress(25);

      // Transform the data for database insertion
      const dbItems = inventoryItems.map(item => ({
        stock_number: item.stock_number,
        shape: item.shape,
        weight: item.weight,
        color: item.color,
        clarity: item.clarity,
        cut: item.cut || 'Excellent',
        price_per_carat: item.price_per_carat,
        lab: item.lab || 'GIA',
        certificate_number: item.certificate_number ? String(item.certificate_number) : null,
        polish: item.polish || 'Excellent',
        symmetry: item.symmetry || 'Excellent',
        fluorescence: item.fluorescence || 'None',
        table_percentage: item.table_percentage || null,
        depth_percentage: item.depth_percentage || null,
        picture: item.picture || null,
        status: item.status || 'Available',
        store_visible: item.store_visible !== undefined ? item.store_visible : true,
        user_id: user.id,
      }));

      setProgress(50);

      // Insert into database using upsert for better handling of duplicates
      const { data, error } = await supabase
        .from('inventory')
        .upsert(dbItems, { 
          onConflict: 'stock_number,user_id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      setProgress(100);

      const successResult: UploadResult = {
        success: true,
        message: `Successfully uploaded ${inventoryItems.length} diamonds to your inventory!`,
        itemsProcessed: inventoryItems.length,
      };

      setResult(successResult);

      toast({
        title: "Upload successful! 🎉",
        description: successResult.message,
      });

      console.log('✅ Upload completed successfully');

    } catch (error) {
      console.error('Upload error:', error);
      
      const errorResult: UploadResult = {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };

      setResult(errorResult);

      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorResult.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setProgress(0);
    setResult(null);
  };

  return {
    uploading,
    progress,
    result,
    handleUpload,
    resetState,
  };
}
