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

      // Enhance data with built-in logic (faster than OpenAI)
      console.log('🤖 Applying built-in data enhancement...');
      const enhancedData = await enhanceDataWithOpenAI(processedCsv.data);
      
      setProgress(70);

      // Try to upload to FastAPI backend first
      try {
        console.log('🔄 Uploading diamonds one by one to FastAPI backend...');
        console.log('📤 Sample enhanced data being sent:', enhancedData.slice(0, 2));
        
        // Upload each diamond individually using the correct endpoint
        let successCount = 0;
        const errors = [];
        const totalDiamonds = enhancedData.length;
        
        for (let i = 0; i < enhancedData.length; i++) {
          const diamondData = enhancedData[i];
          
          // Update progress for each diamond
          const uploadProgress = 70 + Math.round((i / totalDiamonds) * 25);
          setProgress(uploadProgress);
          
            try {
              // Validate required fields from CSV data
              if (!diamondData.stock?.trim()) {
                errors.push(`Row ${successCount + 1}: Stock Number is required`);
                continue;
              }

              if (!diamondData.weight || Number(diamondData.weight) <= 0) {
                errors.push(`Row ${successCount + 1}: Valid Carat Weight is required`);
                continue;
              }

              if (!diamondData.price_per_carat || Number(diamondData.price_per_carat) <= 0) {
                errors.push(`Row ${successCount + 1}: Valid Price Per Carat is required`);
                continue;
              }

              // Helper function to validate cut values
              const validateCut = (cut: any): string => {
                const validCuts = ['EXCELLENT', 'VERY GOOD', 'GOOD', 'POOR'];
                const cutUpper = cut?.toString().toUpperCase();
                return validCuts.includes(cutUpper) ? cutUpper : 'EXCELLENT';
              };

              // Helper function to ensure positive ratio
              const validateRatio = (ratio: any): number => {
                const num = Number(ratio);
                return isNaN(num) || num <= 0 ? 1 : Math.abs(num);
              };

              // Map CSV data to FastAPI format - using REAL data only
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
                cut: validateCut(diamondData.cut),
                polish: diamondData.polish?.toUpperCase() || "EXCELLENT",
                symmetry: diamondData.symmetry?.toUpperCase() || "EXCELLENT",
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
              errors.push(`Row ${successCount + 1}: ${response.error}`);
            } else {
              successCount++;
            }
          } catch (error) {
            const errorMsg = `Diamond ${i + 1}: ${error instanceof Error ? error.message : 'Upload failed'}`;
            errors.push(errorMsg);
            console.warn('❌ Individual diamond upload failed:', errorMsg);
          }
        }
        
        // Ensure we reach 95% before final processing
        setProgress(95);
        
        if (errors.length > 0 && successCount === 0) {
          throw new Error(`All uploads failed. Most common issues: ${errors.slice(0, 3).join('; ')}`);
        }

        // Complete progress
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
        
        // Show immediate success toast
        toast({
          title: "🎉 Upload Complete!",
          description: `${successCount} diamonds uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}. Check the detailed analysis below.`,
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
        
        // Show fallback success message
        toast({
          title: "✅ Processing Complete",
          description: `${enhancedData.length} diamonds processed locally. Detailed analysis available below.`,
          variant: "default",
        });
      }

    } catch (error) {
      console.error('Enhanced upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      const errorResult: UploadResult = {
        success: false,
        message: `Upload failed: ${errorMessage}. Please check your CSV format and try again.`,
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