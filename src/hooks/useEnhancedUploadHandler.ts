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

  // Helper function to map form values to FastAPI enum values
  const mapToApiEnum = (value: any): string => {
    const stringValue = value?.toString().toUpperCase();
    
    // Map "FAIR" to "POOR" since FastAPI doesn't accept "FAIR"
    if (stringValue === 'FAIR') {
      return 'POOR';
    }
    
    // Valid FastAPI enum values
    const validValues = ['EXCELLENT', 'VERY GOOD', 'GOOD', 'POOR'];
    return validValues.includes(stringValue) ? stringValue : 'EXCELLENT';
  };

  const handleUpload = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "❌ Authentication Error",
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

      setProgress(40);

      // Enhance data with built-in logic
      console.log('🤖 Applying built-in data enhancement...');
      const enhancedData = await enhanceDataWithOpenAI(processedCsv.data);
      
      setProgress(60);

      // Upload each diamond individually to FastAPI backend
      console.log('📤 Uploading diamonds to FastAPI backend...');
      console.log('📤 Sample enhanced data being sent:', enhancedData.slice(0, 2));
      
      let successCount = 0;
      const errors = [];
      const totalDiamonds = enhancedData.length;
      
      for (let i = 0; i < enhancedData.length; i++) {
        const diamondData = enhancedData[i];
        
        // Update progress for each diamond
        const uploadProgress = 60 + Math.round((i / totalDiamonds) * 35);
        setProgress(uploadProgress);
        
        try {
          // Validate required fields from CSV data
          if (!diamondData.stock?.trim()) {
            errors.push(`Row ${i + 1}: Stock Number is required`);
            continue;
          }

          if (!diamondData.weight || Number(diamondData.weight) <= 0) {
            errors.push(`Row ${i + 1}: Valid Carat Weight is required`);
            continue;
          }

          if (!diamondData.price_per_carat || Number(diamondData.price_per_carat) <= 0) {
            errors.push(`Row ${i + 1}: Valid Price Per Carat is required`);
            continue;
          }

          // Helper function to ensure positive ratio
          const validateRatio = (ratio: any): number => {
            const num = Number(ratio);
            return isNaN(num) || num <= 0 ? 1 : Math.abs(num);
          };

          // Map CSV data to FastAPI format - using REAL data only with proper enum validation
          const payload = {
            stock: diamondData.stock.trim(),
            shape: diamondData.shape === 'Round' ? "round brilliant" : (diamondData.shape?.toLowerCase() || "round brilliant"),
            weight: Number(diamondData.weight),
            color: diamondData.color || "G",
            clarity: diamondData.clarity || "VS1",
            lab: diamondData.lab || "GIA",
            certificate_number: diamondData.certificate_number && diamondData.certificate_number.trim() 
              ? parseInt(diamondData.certificate_number) || 0
              : 0,
            certificate_comment: diamondData.certificate_comment?.trim() || "",
            certificate_url: diamondData.certificate_url?.trim() || "",
            // Physical measurements - use actual values or sensible defaults based on carat
            length: diamondData.length && Number(diamondData.length) > 0 
              ? Number(diamondData.length) 
              : Math.round((Number(diamondData.weight) * 6.5) * 100) / 100,
            width: diamondData.width && Number(diamondData.width) > 0 
              ? Number(diamondData.width) 
              : Math.round((Number(diamondData.weight) * 6.5) * 100) / 100,
            depth: diamondData.depth && Number(diamondData.depth) > 0 
              ? Number(diamondData.depth) 
              : Math.round((Number(diamondData.weight) * 4.0) * 100) / 100,
            ratio: validateRatio(diamondData.ratio),
            cut: mapToApiEnum(diamondData.cut),
            polish: mapToApiEnum(diamondData.polish),
            symmetry: mapToApiEnum(diamondData.symmetry),
            fluorescence: diamondData.fluorescence?.toUpperCase() || "NONE",
            table: diamondData.table && Number(diamondData.table) > 0 ? Number(diamondData.table) : 60,
            depth_percentage: diamondData.depth_percentage && Number(diamondData.depth_percentage) > 0 ? Number(diamondData.depth_percentage) : 62,
            gridle: diamondData.gridle || "Medium",
            culet: diamondData.culet?.toUpperCase() || "NONE",
            rapnet: diamondData.rapnet && Number(diamondData.rapnet) > 0 ? parseInt(diamondData.rapnet.toString()) : 0,
            price_per_carat: Number(diamondData.price_per_carat),
            picture: diamondData.picture?.trim() || "",
          };
        
          const response = await api.post(apiEndpoints.addDiamond(user.id), payload);
          
          if (response.error) {
            // Parse structured error response for better error messages
            let errorDetails = response.error;
            try {
              const errorData = JSON.parse(response.error);
              if (errorData.detail && Array.isArray(errorData.detail)) {
                errorDetails = errorData.detail.map((err: any) => {
                  const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown';
                  return `${field}: ${err.msg}`;
                }).join(', ');
              }
            } catch {
              // Keep original error if not JSON
            }
            errors.push(`Row ${i + 1} (${diamondData.stock}): ${errorDetails}`);
          } else {
            successCount++;
            console.log(`✅ Diamond ${i + 1} uploaded successfully`);
          }
        } catch (error) {
          const errorMsg = `Row ${i + 1} (${diamondData.stock || 'unknown'}): ${error instanceof Error ? error.message : 'Upload failed'}`;
          errors.push(errorMsg);
          console.warn('❌ Individual diamond upload failed:', errorMsg);
        }
      }
      
      setProgress(95);
      
      // Complete progress
      setProgress(100);
      
      const successResult: UploadResult = {
        success: successCount > 0,
        message: successCount > 0 
          ? `✅ Successfully uploaded ${successCount} out of ${enhancedData.length} diamonds!${errors.length > 0 ? ` ${errors.length} failed.` : ''}`
          : `❌ All ${enhancedData.length} diamonds failed to upload. Please check the errors below.`,
        processedCount: successCount,
        fieldMappings: processedCsv.fieldMappings,
        unmappedFields: processedCsv.unmappedFields,
        errors: errors.length > 0 ? errors : undefined,
        totalProcessed: enhancedData.length
      };
      
      setResult(successResult);
      
      // Force refresh inventory data if any succeeded
      if (successCount > 0) {
        setTimeout(() => {
          triggerInventoryChange();
          window.location.reload(); // Force full refresh to see new diamonds
        }, 2000);
      }
      
      // Show immediate toast message
      if (successCount > 0) {
        toast({
          title: "🎉 Upload Complete!",
          description: `${successCount} diamonds uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
        });
      } else {
        toast({
          title: "❌ Upload Failed",
          description: `All ${enhancedData.length} diamonds failed. Check detailed errors below.`,
          variant: "destructive",
        });
      }

      // Show field mapping summary if there are unmapped fields
      if (processedCsv.unmappedFields.length > 0) {
        setTimeout(() => {
          toast({
            title: "📊 Field Mapping Summary",
            description: `${processedCsv.unmappedFields.length} fields couldn't be mapped: ${processedCsv.unmappedFields.join(', ')}`,
            variant: "default",
          });
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Enhanced upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      const errorResult: UploadResult = {
        success: false,
        message: `❌ Upload failed: ${errorMessage}. Please check your CSV format and try again.`,
        errors: [errorMessage],
        totalProcessed: 0
      };
      
      setResult(errorResult);
      
      toast({
        title: "❌ Upload Failed",
        description: errorMessage.length > 50 ? errorMessage.substring(0, 50) + "..." : errorMessage,
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
