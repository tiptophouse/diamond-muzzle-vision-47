import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from './inventory/useInventoryDataSync';
import { useIntelligentCsvProcessor } from './useIntelligentCsvProcessor';

interface UploadResult {
  success: boolean;
  message: string;
  processedCount?: number;
  errors?: string[];
  fieldMappings?: any[];
  unmappedFields?: string[];
}

export function useEnhancedUploadHandler() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { triggerInventoryChange } = useInventoryDataSync();
  const { processIntelligentCsv } = useIntelligentCsvProcessor();

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
      setProgress(20);
      
      // Process CSV with intelligent field mapping
      console.log('🧠 Processing CSV with intelligent mapping...');
      const processedCsv = await processIntelligentCsv(file);
      
      console.log('🎯 Intelligent mapping results:', {
        totalRows: processedCsv.totalRows,
        mappedFields: processedCsv.successfulMappings,
        unmappedFields: processedCsv.unmappedFields.length
      });

      setProgress(50);

      // Try to upload to FastAPI backend first
      try {
        console.log('🔄 Uploading to FastAPI backend...');
        console.log('📤 Sample data being sent:', processedCsv.data.slice(0, 2));
        
        const response = await api.uploadCsv(apiEndpoints.uploadInventory(), processedCsv.data, user.id);
        
        if (response.error) {
          throw new Error(response.error);
        }

        setProgress(100);
        
        const successResult: UploadResult = {
          success: true,
          message: `Successfully uploaded ${processedCsv.totalRows} diamonds! Mapped ${processedCsv.successfulMappings} fields automatically.`,
          processedCount: processedCsv.totalRows,
          fieldMappings: processedCsv.fieldMappings,
          unmappedFields: processedCsv.unmappedFields
        };
        
        setResult(successResult);
        
        // Force refresh inventory data with delay to ensure backend processing
        setTimeout(() => {
          triggerInventoryChange();
          window.location.reload(); // Force full refresh to see new diamonds
        }, 2000);
        
        // Show detailed success message
        toast({
          title: "🎉 Smart Upload Successful!",
          description: `Processed ${processedCsv.totalRows} diamonds with ${processedCsv.successfulMappings} field mappings`,
        });

        // Show field mapping summary if there are unmapped fields
        if (processedCsv.unmappedFields.length > 0) {
          setTimeout(() => {
            toast({
              title: "📊 Field Mapping Summary",
              description: `${processedCsv.unmappedFields.length} fields couldn't be mapped automatically: ${processedCsv.unmappedFields.join(', ')}`,
              variant: "default",
            });
          }, 2000);
        }

      } catch (apiError) {
        console.warn('FastAPI upload failed, using fallback method:', apiError);
        
        // Fallback: Store in localStorage 
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        const newData = processedCsv.data.map((item, index) => ({
          id: `upload-${Date.now()}-${index}`,
          stockNumber: item.stock,
          shape: item.shape,
          carat: item.weight,
          color: item.color,
          clarity: item.clarity,
          cut: item.cut,
          price: item.price_per_carat * item.weight,
          status: 'Available',
          store_visible: true,
          certificateNumber: item.certificate_number?.toString(),
          lab: item.lab,
          user_id: user.id
        }));
        
        localStorage.setItem('diamond_inventory', JSON.stringify([...existingData, ...newData]));
        
        setProgress(100);
        
        const fallbackResult: UploadResult = {
          success: true,
          message: `Processed ${processedCsv.totalRows} diamonds locally (backend unavailable). Smart mapping applied ${processedCsv.successfulMappings} fields.`,
          processedCount: processedCsv.totalRows,
          fieldMappings: processedCsv.fieldMappings,
          unmappedFields: processedCsv.unmappedFields
        };
        
        setResult(fallbackResult);
        triggerInventoryChange();
        
        toast({
          title: "✅ Smart Processing Complete",
          description: `Processed ${processedCsv.totalRows} diamonds with intelligent field mapping`,
          variant: "default",
        });
      }

    } catch (error) {
      console.error('Enhanced upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      const errorResult: UploadResult = {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
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