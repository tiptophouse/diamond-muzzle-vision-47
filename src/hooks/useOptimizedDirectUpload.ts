
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useEnhancedCsvProcessor, InventoryItem } from "./useEnhancedCsvProcessor";

interface UploadResult {
  success: boolean;
  message: string;
  totalItems: number;
  successCount: number;
  errors: string[];
  failedRows?: number[];
}

export function useOptimizedDirectUpload() {
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
      console.log('🚀 Starting optimized CSV processing...');
      
      const inventoryItems = await processCSV(file);
      
      if (!inventoryItems || inventoryItems.length === 0) {
        throw new Error('No valid items found in the CSV file');
      }

      console.log(`📊 Processing ${inventoryItems.length} items optimally...`);
      setProgress(25);

      // Batch process in chunks for better performance
      const BATCH_SIZE = 50;
      const batches = [];
      for (let i = 0; i < inventoryItems.length; i += BATCH_SIZE) {
        batches.push(inventoryItems.slice(i, i + BATCH_SIZE));
      }

      let totalProcessed = 0;
      const allErrors: string[] = [];

      for (const [index, batch] of batches.entries()) {
        const dbItems = batch.map(item => ({
          stock_number: item.stock_number,
          shape: item.shape,
          weight: item.weight,
          color: item.color,
          clarity: item.clarity,
          cut: item.cut || 'Excellent',
          price_per_carat: item.price_per_carat,
          lab: item.lab || 'GIA',
          certificate_number: item.certificate_number ? parseInt(String(item.certificate_number)) || null : null,
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

        try {
          const { error } = await supabase
            .from('inventory')
            .upsert(dbItems, { 
              onConflict: 'stock_number,user_id',
              ignoreDuplicates: false 
            });

          if (error) throw error;
          totalProcessed += batch.length;
        } catch (error) {
          console.error(`Batch ${index + 1} error:`, error);
          allErrors.push(`Batch ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        setProgress(25 + (75 * (index + 1)) / batches.length);
      }

      const successResult: UploadResult = {
        success: totalProcessed > 0,
        message: totalProcessed === inventoryItems.length 
          ? `Successfully uploaded all ${inventoryItems.length} diamonds!`
          : `Uploaded ${totalProcessed} of ${inventoryItems.length} diamonds. ${allErrors.length} batches had errors.`,
        totalItems: inventoryItems.length,
        successCount: totalProcessed,
        errors: allErrors,
      };

      setResult(successResult);

      toast({
        title: successResult.success ? "Upload successful! ✨" : "Partial upload completed",
        description: successResult.message,
        variant: successResult.success ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      const errorResult: UploadResult = {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        totalItems: 0,
        successCount: 0,
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
