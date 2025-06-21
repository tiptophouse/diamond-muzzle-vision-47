
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from './inventory/useInventoryDataSync';
import { api, apiEndpoints } from '@/lib/api';

interface UploadResult {
  success: boolean;
  message: string;
  processedCount?: number;
  errors?: string[];
  uploadedCount?: number;
  failedCount?: number;
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
        title: "❌ Authentication Required",
        description: "Please log in to upload inventory files",
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

      setProgress(15);

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

      setProgress(30);

      // Process and upload diamonds to FastAPI backend
      const processedDiamonds = csvData.map(item => ({
        user_id: user.id,
        stock_number: item['Stock Number'] || item['stock_number'] || `STK-${Date.now()}-${Math.random()}`,
        shape: item['Shape'] || item['shape'] || 'Round',
        weight: parseFloat(item['Carat'] || item['carat'] || item['Weight'] || '1.0'),
        color: item['Color'] || item['color'] || 'G',
        clarity: item['Clarity'] || item['clarity'] || 'VS1',
        cut: item['Cut'] || item['cut'] || 'Excellent',
        price: parseFloat(item['Price'] || item['price'] || item['Total Price'] || '5000'),
        price_per_carat: Math.round((parseFloat(item['Price'] || item['price'] || '5000') / parseFloat(item['Carat'] || item['carat'] || '1.0'))),
        status: 'Available',
        store_visible: true,
        certificate_number: item['Certificate Number'] || item['certificate_number'] || '',
        lab: item['Lab'] || item['lab'] || 'GIA',
        picture: '',
        certificate_url: ''
      }));

      setProgress(50);

      // Upload diamonds in batches to FastAPI
      let uploadedCount = 0;
      let failedCount = 0;
      const batchSize = 5;

      for (let i = 0; i < processedDiamonds.length; i += batchSize) {
        const batch = processedDiamonds.slice(i, i + batchSize);
        
        for (const diamond of batch) {
          try {
            const result = await api.post(apiEndpoints.addDiamond(user.id), diamond);
            
            if (result.error) {
              console.error('❌ Failed to upload diamond:', diamond.stock_number, result.error);
              failedCount++;
            } else {
              uploadedCount++;
            }
          } catch (error) {
            console.error('❌ Error uploading diamond:', diamond.stock_number, error);
            failedCount++;
          }
        }

        // Update progress
        const completedItems = Math.min(i + batchSize, processedDiamonds.length);
        setProgress(50 + (completedItems / processedDiamonds.length) * 50);
      }

      setProgress(100);
      
      // Trigger inventory refresh
      triggerInventoryChange();

      // Determine result based on upload success
      let successResult: UploadResult;
      
      if (uploadedCount > 0 && failedCount === 0) {
        successResult = {
          success: true,
          message: `🎉 Successfully uploaded all ${uploadedCount} diamonds to your inventory!`,
          processedCount: processedDiamonds.length,
          uploadedCount,
          failedCount: 0
        };
        
        toast({
          title: "✅ Upload Complete!",
          description: `Successfully uploaded ${uploadedCount} diamonds to your secure inventory`,
        });
      } else if (uploadedCount > 0 && failedCount > 0) {
        successResult = {
          success: true,
          message: `⚠️ Partially successful: ${uploadedCount} diamonds uploaded, ${failedCount} failed`,
          processedCount: processedDiamonds.length,
          uploadedCount,
          failedCount
        };
        
        toast({
          title: "⚠️ Partial Upload Success",
          description: `${uploadedCount} diamonds uploaded successfully, ${failedCount} failed`,
          variant: "destructive",
        });
      } else {
        throw new Error(`Failed to upload any diamonds. ${failedCount} items failed processing.`);
      }
      
      setResult(successResult);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      const errorResult: UploadResult = {
        success: false,
        message: `❌ Upload failed: ${errorMessage}`,
        errors: [errorMessage],
        uploadedCount: 0,
        failedCount: 0
      };
      
      setResult(errorResult);
      
      toast({
        title: "❌ Upload Failed",
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
