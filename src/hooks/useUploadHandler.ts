
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from './inventory/useInventoryDataSync';
import { useBulkUploadNotifications } from './useBulkUploadNotifications';

interface UploadResult {
  success: boolean;
  message: string;
  processedCount?: number;
  errors?: string[];
}

export function useUploadHandler() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { triggerInventoryChange } = useInventoryDataSync();
  const { sendBulkUploadNotification } = useBulkUploadNotifications();

  const handleUpload = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to upload files",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      // Parse CSV file
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const csvData = [];

      setProgress(25);

      // Process CSV rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          csvData.push(row);
        }
      }

      setProgress(50);

      // Try to upload to FastAPI backend first
      try {
        console.log('🔄 Attempting upload to FastAPI backend...');
        const response = await api.uploadCsv(apiEndpoints.uploadInventory(), csvData, user.id);
        
        if (response.error) {
          throw new Error(response.error);
        }

        setProgress(100);
        
        const successResult: UploadResult = {
          success: true,
          message: `Successfully uploaded ${csvData.length} diamonds to your inventory!`,
          processedCount: csvData.length
        };
        
        setResult(successResult);
        triggerInventoryChange();
        
        // Send bulk upload notification if count > 80
        if (csvData.length > 80) {
          console.log('📢 Sending bulk upload notification to Telegram group...');
          await sendBulkUploadNotification({
            diamondCount: csvData.length,
            uploadType: 'csv'
          });
        }
        
        toast({
          title: "Upload Successful! 🎉",
          description: `${successResult.message}${csvData.length > 80 ? ' Community has been notified!' : ''}`,
        });

      } catch (apiError) {
        console.warn('FastAPI upload failed, using fallback method:', apiError);
        
        // Fallback: Store in localStorage for demo purposes
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        const newData = csvData.map((item, index) => ({
          id: `upload-${Date.now()}-${index}`,
          stockNumber: item['Stock Number'] || item['stock_number'] || `STK-${Date.now()}-${index}`,
          shape: item['Shape'] || item['shape'] || 'Round',
          carat: parseFloat(item['Carat'] || item['carat'] || item['Weight'] || '1.0'),
          color: item['Color'] || item['color'] || 'G',
          clarity: item['Clarity'] || item['clarity'] || 'VS1',
          cut: item['Cut'] || item['cut'] || 'Excellent',
          price: parseFloat(item['Price'] || item['price'] || item['Total Price'] || '5000'),
          status: 'Available',
          store_visible: true,
          user_id: user.id
        }));
        
        localStorage.setItem('diamond_inventory', JSON.stringify([...existingData, ...newData]));
        
        setProgress(100);
        
        const fallbackResult: UploadResult = {
          success: true,
          message: `Uploaded ${csvData.length} diamonds (stored locally - backend unavailable)`,
          processedCount: csvData.length
        };
        
        setResult(fallbackResult);
        triggerInventoryChange();
        
        // Send bulk upload notification even for fallback if count > 80
        if (csvData.length > 80) {
          console.log('📢 Sending bulk upload notification to Telegram group (fallback)...');
          await sendBulkUploadNotification({
            diamondCount: csvData.length,
            uploadType: 'csv'
          });
        }
        
        toast({
          title: "Upload Completed (Local Storage)",
          description: `${fallbackResult.message}${csvData.length > 80 ? ' Community has been notified!' : ''}`,
          variant: "default",
        });
      }

    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      const errorResult: UploadResult = {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
      
      setResult(errorResult);
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setProgress(0);
    setResult(null);
    setUploading(false);
  };

  return {
    uploading,
    progress,
    result,
    handleUpload,
    resetState,
  };
}
