
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface ProcessResult {
  success: boolean;
  totalStones: number;
  errors: string[];
  processedData?: any[];
}

export function useUploadHandler() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const resetState = () => {
    setIsProcessing(false);
    setUploadProgress(0);
    setResult(null);
  };

  const processFile = async (file: File): Promise<ProcessResult> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsProcessing(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user.id.toString());

    try {
      setUploadProgress(30);

      // Create the upload request with proper error handling
      const response = await fetch(`${api.API_BASE_URL || 'https://api.mazalbot.com'}${apiEndpoints.uploadInventory()}`, {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(60);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setUploadProgress(80);

      if (data.error) {
        throw new Error(data.error);
      }

      setUploadProgress(100);

      const processResult: ProcessResult = {
        success: true,
        totalStones: data.total_processed || 0,
        errors: data.errors || [],
        processedData: data.processed_data || []
      };

      setResult(processResult);

      toast({
        title: "Upload Successful",
        description: `Successfully processed ${processResult.totalStones} diamonds`,
      });

      return processResult;

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      const errorResult: ProcessResult = {
        success: false,
        totalStones: 0,
        errors: [errorMessage]
      };

      setResult(errorResult);

      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: errorMessage,
      });

      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processFile,
    isProcessing,
    uploadProgress,
    result,
    resetState,
  };
}
