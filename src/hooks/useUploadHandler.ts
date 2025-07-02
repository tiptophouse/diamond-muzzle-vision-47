
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from './inventory/useInventoryDataSync';
import { LocalStorageService } from '@/services/localStorageService';

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

      // Process data for local storage
      const processedDiamonds = csvData.map(item => ({
        stock_number: item['Stock Number'] || item['stock_number'] || `STK-${Date.now()}-${Math.random()}`,
        shape: item['Shape'] || item['shape'] || 'Round',
        weight: parseFloat(item['Carat'] || item['carat'] || item['Weight'] || '1.0'),
        color: item['Color'] || item['color'] || 'G',
        clarity: item['Clarity'] || item['clarity'] || 'VS1',
        cut: item['Cut'] || item['cut'] || 'Excellent',
        price: parseFloat(item['Price'] || item['price'] || item['Total Price'] || '5000'),
        status: 'Available',
        store_visible: true,
        certificate_number: item['Certificate Number'] || item['certificate_number'] || '',
        lab: item['Lab'] || item['lab'] || '',
      }));

      setProgress(75);

      console.log('📦 Uploading', processedDiamonds.length, 'diamonds to local storage...');
      const uploadResult = LocalStorageService.bulkAddDiamonds(processedDiamonds);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setProgress(100);
      
      const successResult: UploadResult = {
        success: true,
        message: `Successfully uploaded ${processedDiamonds.length} diamonds to your local inventory! 💎`,
        processedCount: processedDiamonds.length
      };
      
      setResult(successResult);
      triggerInventoryChange();
      
      toast({
        title: "Upload Successful! 🎉",
        description: successResult.message,
      });

    } catch (error) {
      console.error('❌ Upload failed:', error);
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
