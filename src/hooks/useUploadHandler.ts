
import { useState } from "react";
import { api, apiEndpoints } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useCsvProcessor } from "./useCsvProcessor";

interface UploadResultData {
  totalItems: number;
  matchedPairs: number;
  errors: string[];
}

interface UploadResponse {
  matched_pairs?: number;
  errors?: string[];
}

export const useUploadHandler = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResultData | null>(null);
  const { user, isAuthenticated } = useTelegramAuth();
  const { parseCSVFile, mapCsvData } = useCsvProcessor();

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress > 95) {
        clearInterval(interval);
        currentProgress = 95;
      }
      setProgress(Math.min(currentProgress, 95));
    }, 300);

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

    setUploading(true);
    setProgress(0);
    
    const cleanup = simulateProgress();

    try {
      console.log('Starting upload for user:', user.id);
      
      const csvData = await parseCSVFile(selectedFile);
      const mappedData = mapCsvData(csvData);
      
      const response = await api.uploadCsv<UploadResponse>(
        apiEndpoints.uploadInventory(),
        mappedData,
        user.id
      );
      
      setProgress(100);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const uploadResult: UploadResultData = {
        totalItems: mappedData.length,
        matchedPairs: response.data?.matched_pairs || 0,
        errors: response.data?.errors || [],
      };
      
      setResult(uploadResult);
      
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${mappedData.length} diamonds to your inventory.`,
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      
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
