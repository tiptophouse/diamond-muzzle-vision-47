
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api, apiEndpoints, API_BASE_URL } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from './inventory/useInventoryDataSync';
import { useIntelligentCsvProcessor } from './useIntelligentCsvProcessor';
import { useOpenAICsvEnhancer } from './useOpenAICsvEnhancer';
import { useBulkUploadNotifications } from './useBulkUploadNotifications';

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
  const { sendBulkUploadNotification } = useBulkUploadNotifications();

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

      // Helper functions for validation and processing
      const validateRatio = (ratio: any): number => {
        const num = Number(ratio);
        return isNaN(num) || num <= 0 ? 1 : Math.abs(num);
      };

      const processCertificateNumber = (certNum: any): number => {
        if (certNum === null || certNum === undefined || certNum === '') {
          return 0;
        }
        
        if (typeof certNum === 'number') {
          return Math.floor(Math.abs(certNum)) || 0;
        }
        
        if (typeof certNum === 'string') {
          const cleanedCert = certNum.trim().replace(/\D/g, '');
          return parseInt(cleanedCert) || 0;
        }
        
        return 0;
      };

      // Prepare diamonds for batch upload
      console.log('📤 Preparing diamonds for batch upload to FastAPI backend...');
      console.log('📤 Sample enhanced data being sent:', enhancedData.slice(0, 2));
      
      const errors = [];
      const validDiamonds = [];
      
      // Validate and format each diamond
      for (let i = 0; i < enhancedData.length; i++) {
        const diamondData = enhancedData[i];
        
        try {
          // Debug log the diamond data
          console.log(`🔍 Processing diamond ${i + 1}:`, diamondData);
          
          // Validate required fields
          if (!diamondData.stock?.trim()) {
            errors.push(`Row ${i + 1}: Stock Number is required`);
            continue;
          }

          if (!diamondData.weight || Number(diamondData.weight) <= 0) {
            errors.push(`Row ${i + 1}: Valid Carat Weight is required`);
            continue;
          }

          // Price per carat - try multiple field names and use rapnet as fallback
          const pricePerCarat = diamondData.price_per_carat || diamondData.rapnet || diamondData.RapnetAskingPrice || 1000;
          if (!pricePerCarat || Number(pricePerCarat) <= 0) {
            console.log(`⚠️ Row ${i + 1}: No valid price found, using default 1000`);
          }

          // Format diamond for batch API - Match EXACT FastAPI requirements
          const formattedDiamond = {
            // Required fields per FastAPI schema
            stock: diamondData.stock.trim(),
            shape: diamondData.shape === 'Round' ? "round brilliant" : (diamondData.shape?.toLowerCase() || "round brilliant"),
            weight: Number(diamondData.weight),
            color: diamondData.color || "G",
            clarity: diamondData.clarity || "VS1",
            certificate_number: processCertificateNumber(diamondData.certificate_number) || 1000000, // Required int field
            
            // Required fields with defaults
            polish: mapToApiEnum(diamondData.polish),
            symmetry: mapToApiEnum(diamondData.symmetry),
            fluorescence: diamondData.fluorescence?.toUpperCase() || "NONE",
            table: diamondData.table && Number(diamondData.table) > 0 ? Number(diamondData.table) : 60.0,
            depth_percentage: diamondData.depth_percentage && Number(diamondData.depth_percentage) > 0 ? Number(diamondData.depth_percentage) : 62.0,
            gridle: diamondData.gridle || "Medium",
            culet: diamondData.culet?.toUpperCase() || "NONE",
            
            // Optional fields
            lab: diamondData.lab || "GIA",
            length: diamondData.length && Number(diamondData.length) > 0 ? Number(diamondData.length) : undefined,
            width: diamondData.width && Number(diamondData.width) > 0 ? Number(diamondData.width) : undefined,
            depth: diamondData.depth && Number(diamondData.depth) > 0 ? Number(diamondData.depth) : undefined,
            ratio: diamondData.ratio && Number(diamondData.ratio) > 0 ? Number(diamondData.ratio) : undefined,
            cut: diamondData.cut ? mapToApiEnum(diamondData.cut) : undefined,
            certificate_comment: diamondData.certificate_comment?.toString().trim() || undefined,
            rapnet: diamondData.rapnet && Number(diamondData.rapnet) > 0 ? parseInt(diamondData.rapnet.toString()) : undefined,
            price_per_carat: Number(pricePerCarat) > 0 ? parseInt(pricePerCarat.toString()) : 1000,
            picture: diamondData.picture?.toString().trim() || undefined,
          };
          
          validDiamonds.push(formattedDiamond);
        } catch (error) {
          const errorMsg = `Row ${i + 1} (${diamondData.stock || 'unknown'}): ${error instanceof Error ? error.message : 'Validation failed'}`;
          errors.push(errorMsg);
        }
      }

      setProgress(80);

      let successCount = 0;
      
      // Send diamonds directly to your FastAPI endpoint
      if (validDiamonds.length > 0) {
        try {
          console.log(`📤 Sending ${validDiamonds.length} diamonds to FastAPI...`);
          
          const fastApiUrl = `https://api.mazalbot.com/api/v1/diamonds/batch?user_id=${user.id}`;
          const payload = { diamonds: validDiamonds };
          
          console.log('📤 FastAPI URL:', fastApiUrl);
          console.log('📤 Payload sample:', JSON.stringify({ diamonds: validDiamonds.slice(0, 1) }, null, 2));
          
          const response = await fetch(fastApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(payload)
          });
          
          console.log('📤 Response status:', response.status);
          const responseData = await response.json();
          console.log('📤 Response data:', responseData);
          
          if (response.ok) {
            successCount = validDiamonds.length;
            console.log(`✅ Successfully sent ${successCount} diamonds to FastAPI`);
            
            // Send bulk upload notification if count > 80
            if (successCount > 80) {
              console.log('📢 Sending bulk upload notification to Telegram group...');
              await sendBulkUploadNotification({
                diamondCount: successCount,
                uploadType: 'csv'
              });
            }
            
            toast({
              title: "🎉 Upload Successful!",
              description: `${successCount} diamonds uploaded successfully${successCount > 80 ? ' and community notified!' : ''}`,
            });
          } else {
            errors.push(`API Error: ${responseData.detail || 'Upload failed'}`);
            
            toast({
              title: "❌ Upload Failed",
              description: `API Error: ${responseData.detail || 'Upload failed'}`,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('❌ FastAPI upload error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          errors.push(`Upload Error: ${errorMessage}`);
          
          toast({
            title: "❌ Upload Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
      
      setProgress(95);
      
      // Complete progress
      setProgress(100);
      
      const successResult: UploadResult = {
        success: successCount > 0,
        message: successCount > 0 
          ? `✅ Successfully uploaded ${successCount} out of ${enhancedData.length} diamonds!${errors.length > 0 ? ` ${errors.length} failed.` : ''}${successCount > 80 ? ' 📢 Community has been notified!' : ''}`
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
        const notificationMessage = successCount > 80 ? ' and community notified!' : '';
        toast({
          title: "🎉 Upload Complete!",
          description: `${successCount} diamonds uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}${notificationMessage}`,
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
