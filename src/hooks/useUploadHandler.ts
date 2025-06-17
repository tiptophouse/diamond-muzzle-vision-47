
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
  success?: boolean;
  message?: string;
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
      currentProgress += Math.random() * 15;
      if (currentProgress > 90) {
        clearInterval(interval);
        currentProgress = 90;
      }
      setProgress(Math.min(currentProgress, 90));
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

    setUploading(true);
    setProgress(0);
    
    const cleanup = simulateProgress();

    try {
      console.log('Starting CSV upload for user:', user.id);
      
      const csvData = await parseCSVFile(selectedFile);
      console.log('Parsed CSV data:', csvData.length, 'rows');
      
      const mappedData = mapCsvData(csvData);
      console.log('Mapped data for upload:', mappedData.length, 'diamonds');
      
      // Use the uploadCsv method from api client
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
        matchedPairs: response.data?.matched_pairs || mappedData.length,
        errors: response.data?.errors || [],
      };
      
      setResult(uploadResult);
      
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${mappedData.length} diamonds to your inventory.`,
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Set progress to 100% even on error to stop the simulation
      setProgress(100);
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your CSV file. Please check your network connection and try again.",
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
