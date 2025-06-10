
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useCsvProcessor } from "./useCsvProcessor";

interface UploadResultData {
  totalItems: number;
  matchedPairs: number;
  errors: string[];
}

interface UploadResponse {
  success: boolean;
  totalItems: number;
  matched_pairs?: number;
  errors?: string[];
  error?: string;
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
      console.log('🚀 Starting upload for user:', user.id);
      
      // Parse CSV file
      const csvData = await parseCSVFile(selectedFile);
      console.log('📄 Parsed CSV data:', csvData.length, 'rows');
      
      const mappedData = mapCsvData(csvData);
      console.log('🔄 Mapped data:', mappedData.length, 'diamonds');
      
      setProgress(50);
      
      // Call our new Supabase edge function
      const { data: response, error } = await supabase.functions.invoke('upload-inventory', {
        body: {
          diamonds: mappedData,
          user_id: user.id
        }
      });
      
      setProgress(100);
      
      if (error) {
        console.error('❌ Upload error:', error);
        throw new Error(error.message || 'Upload failed');
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Upload failed');
      }
      
      const uploadResult: UploadResultData = {
        totalItems: response.totalItems || mappedData.length,
        matchedPairs: response.matched_pairs || 0,
        errors: response.errors || [],
      };
      
      setResult(uploadResult);
      
      toast({
        title: "Upload successful!",
        description: `Successfully uploaded ${response.totalItems} diamonds to your inventory.`,
      });
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      
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
