
import { useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { api, apiEndpoints } from '@/lib/api';

interface UploadProgress {
  percentage: number;
  completed: number;
  failed: number;
  errors?: string[];
}

interface UploadResult {
  success: boolean;
  successCount: number;
  failCount: number;
}

export function useBulkUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useTelegramAuth();

  const uploadDiamonds = async (
    data: any[], 
    userId: number, 
    onProgress: (progress: UploadProgress) => void
  ): Promise<UploadResult> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsUploading(true);
    
    try {
      const response = await api.post(apiEndpoints.addDiamondsBatch(userId), {
        diamonds: data
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Simulate progress updates
      onProgress({ percentage: 100, completed: data.length, failed: 0 });

      return {
        success: true,
        successCount: data.length,
        failCount: 0
      };
    } catch (error) {
      console.error('Bulk upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadDiamonds,
    isUploading
  };
}
