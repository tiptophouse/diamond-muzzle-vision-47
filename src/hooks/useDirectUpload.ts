
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedCsvProcessor } from "./useEnhancedCsvProcessor";

interface UploadResultData {
  totalItems: number;
  successCount: number;
  errors: string[];
  failedRows?: number[];
}

export const useDirectUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResultData | null>(null);
  const { user, isAuthenticated } = useTelegramAuth();
  const { parseCSVFile, mapCsvToInventory, validateFile } = useEnhancedCsvProcessor();

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 85) {
        clearInterval(interval);
        currentProgress = 85;
      }
      setProgress(Math.min(currentProgress, 85));
    }, 200);

    return () => clearInterval(interval);
  };

  const handleUpload = async (selectedFile: File) => {
    if (!selectedFile || !isAuthenticated || !user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please make sure you're logged in to upload files.",
      });
      return;
    }

    if (!validateFile(selectedFile)) {
      return;
    }

    setUploading(true);
    setProgress(0);
    setResult(null);
    
    const cleanup = simulateProgress();

    try {
      console.log('Starting direct upload for user:', user.id);
      console.log('File details:', { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type });
      
      toast({
        title: "Processing file...",
        description: "Parsing your CSV file and validating data.",
      });

      // Parse CSV file
      const csvData = await parseCSVFile(selectedFile);
      console.log('Parsed CSV data:', csvData.length, 'rows');
      
      if (csvData.length === 0) {
        throw new Error('No data found in CSV file');
      }

      setProgress(40);
      
      // Map to inventory format
      const inventoryData = mapCsvToInventory(csvData, user.id);
      console.log('Mapped inventory data:', inventoryData.length, 'items');
      
      setProgress(60);

      toast({
        title: "Uploading to database...",
        description: `Processing ${inventoryData.length} diamonds.`,
      });
      
      // Insert into Supabase in batches
      const batchSize = 50; // Smaller batches for better reliability
      let successCount = 0;
      let errors: string[] = [];
      let failedRows: number[] = [];
      
      for (let i = 0; i < inventoryData.length; i += batchSize) {
        const batch = inventoryData.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        console.log(`Inserting batch ${batchNumber}:`, batch.length, 'items');
        
        try {
          const { data, error } = await supabase
            .from('inventory')
            .insert(batch)
            .select();
          
          if (error) {
            console.error('Batch insert error:', error);
            errors.push(`Batch ${batchNumber}: ${error.message}`);
            
            // Track failed rows
            for (let j = 0; j < batch.length; j++) {
              failedRows.push(i + j + 1);
            }
          } else {
            successCount += data?.length || 0;
            console.log(`Batch ${batchNumber} success:`, data?.length, 'items inserted');
          }
        } catch (batchError) {
          console.error('Batch processing error:', batchError);
          errors.push(`Batch ${batchNumber}: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`);
          
          // Track failed rows
          for (let j = 0; j < batch.length; j++) {
            failedRows.push(i + j + 1);
          }
        }

        // Update progress
        const progressPercent = 60 + ((i + batchSize) / inventoryData.length) * 35;
        setProgress(Math.min(progressPercent, 95));
      }
      
      setProgress(100);
      
      const uploadResult: UploadResultData = {
        totalItems: inventoryData.length,
        successCount: successCount,
        errors: errors,
        failedRows: failedRows,
      };
      
      setResult(uploadResult);
      
      if (successCount > 0) {
        toast({
          title: "Upload successful! 🎉",
          description: `Successfully uploaded ${successCount} of ${inventoryData.length} diamonds to your inventory.`,
        });
      }
      
      if (errors.length > 0) {
        toast({
          variant: "destructive",
          title: "Partial upload failure",
          description: `${errors.length} batches failed. Check the upload results for details.`,
        });
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      const uploadResult: UploadResultData = {
        totalItems: 0,
        successCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      };
      
      setResult(uploadResult);
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your CSV file.",
      });
    } finally {
      setUploading(false);
      cleanup();
    }
  };

  const resetState = () => {
    setResult(null);
    setProgress(0);
  };

  return {
    uploading,
    progress,
    result,
    handleUpload,
    resetState
  };
};
