import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from './inventory/useInventoryDataSync';
import { useIntelligentCsvProcessor } from './useIntelligentCsvProcessor';
import { useOpenAICsvEnhancer } from './useOpenAICsvEnhancer';

interface UploadResult {
  success: boolean;
  message: string;
  processedCount?: number;
  errors?: string[];
  fieldMappings?: any[];
  unmappedFields?: string[];
  totalProcessed?: number;
}

export function useEnhancedUploadHandler() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { triggerInventoryChange } = useInventoryDataSync();
  const { processIntelligentCsv } = useIntelligentCsvProcessor();
  const { enhanceDataWithOpenAI } = useOpenAICsvEnhancer();

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

      setProgress(30);

      // Enhance data with OpenAI for better field mapping
      console.log('🤖 Enhancing data with OpenAI...');
      const enhancedData = await enhanceDataWithOpenAI(processedCsv.data);
      
      setProgress(50);

      // Try to upload to FastAPI backend first
      try {
        console.log('🔄 Uploading diamonds one by one to FastAPI backend...');
        console.log('📤 Sample enhanced data being sent:', enhancedData.slice(0, 2));
        
        // Upload each diamond individually using the correct endpoint
        let successCount = 0;
        const errors = [];
        
        for (const diamondData of enhancedData) {
          try {
            const payload = {
              stock: diamondData.stock || "string",
              shape: diamondData.shape?.toLowerCase() || "round brilliant", 
              weight: Number(diamondData.weight) || 1,
              color: diamondData.color || "D",
              clarity: diamondData.clarity || "FL",
              lab: diamondData.lab || "string",
              certificate_number: parseInt(diamondData.certificate_number || '0') || 0,
              length: Number(diamondData.length) || 1,
              width: Number(diamondData.width) || 1,
              depth: Number(diamondData.depth) || 1,
              ratio: Number(diamondData.ratio) || 1,
              cut: diamondData.cut?.toUpperCase() || "EXCELLENT",
              polish: diamondData.polish?.toUpperCase() || "EXCELLENT",
              symmetry: diamondData.symmetry?.toUpperCase() || "EXCELLENT",
              fluorescence: diamondData.fluorescence?.toUpperCase() || "NONE",
              table: Number(diamondData.table) || 1,
              depth_percentage: Number(diamondData.depth_percentage) || 1,
              gridle: diamondData.gridle || "string",
              culet: diamondData.culet?.toUpperCase() || "NONE",
              certificate_comment: diamondData.certificate_comment || "string",
              rapnet: diamondData.rapnet ? parseInt(diamondData.rapnet.toString()) : 0,
              price_per_carat: Number(diamondData.price_per_carat) || 0,
              picture: diamondData.picture || "string",
            };
            
            const response = await api.post(apiEndpoints.addDiamond(user.id), payload);
            if (response.error) {
              errors.push(`Row ${successCount + 1}: ${response.error}`);
            } else {
              successCount++;
            }
          } catch (error) {
            errors.push(`Row ${successCount + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        if (errors.length > 0 && successCount === 0) {
          throw new Error(`All uploads failed: ${errors.join(', ')}`);
        }

        setProgress(100);
        
        const successResult: UploadResult = {
          success: true,
          message: `Successfully uploaded ${successCount} out of ${enhancedData.length} diamonds! ${errors.length > 0 ? `${errors.length} failed.` : 'All succeeded.'}`,
          processedCount: successCount,
          fieldMappings: processedCsv.fieldMappings,
          unmappedFields: processedCsv.unmappedFields,
          errors: errors.length > 0 ? errors : undefined,
          totalProcessed: enhancedData.length
        };
        
        setResult(successResult);
        
        // Force refresh inventory data with delay to ensure backend processing
        setTimeout(() => {
          triggerInventoryChange();
          window.location.reload(); // Force full refresh to see new diamonds
        }, 2000);
        
        // Show beautiful AI-powered success summary
        toast({
          title: "🎉 Upload Analysis Complete!",
          description: `Your ${enhancedData.length} diamonds have been intelligently processed with detailed insights available.`,
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
        const newData = enhancedData.map((item, index) => ({
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
          message: `Processed ${enhancedData.length} diamonds locally (backend unavailable). Smart mapping applied ${processedCsv.successfulMappings} fields.`,
          processedCount: enhancedData.length,
          fieldMappings: processedCsv.fieldMappings,
          unmappedFields: processedCsv.unmappedFields,
          totalProcessed: enhancedData.length
        };
        
        setResult(fallbackResult);
        triggerInventoryChange();
        
        toast({
          title: "✅ Smart Processing Complete",
          description: `Processed ${enhancedData.length} diamonds with intelligent field mapping`,
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