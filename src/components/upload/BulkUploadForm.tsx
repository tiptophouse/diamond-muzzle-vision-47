import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { BulkFileUploadArea } from "./BulkFileUploadArea";
import { CsvValidationResults } from "./CsvValidationResults";
import { BulkUploadProgress } from "./BulkUploadProgress";
import { ProcessingReport } from "./ProcessingReport";
import { useBulkCsvProcessor } from "@/hooks/useBulkCsvProcessor";

export function BulkUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();
  const { user } = useTelegramAuth();
  const { processedData, validationResults, processFile, resetProcessor, downloadFailedRecords } = useBulkCsvProcessor();

  // All required fields for the API - every field must be present
  const requiredFields = [
    'stock', 'shape', 'weight', 'color', 'clarity', 'lab', 'certificate_number',
    'length', 'width', 'depth', 'ratio', 'cut', 'polish', 'symmetry', 
    'fluorescence', 'table', 'depth_percentage', 'gridle', 'culet', 
    'certificate_comment', 'rapnet', 'price_per_carat', 'picture'
  ];

  async function handleBulkUpload() {
    if (!processedData?.validRows.length) {
      toast({
        title: "❌ No Valid Data",
        description: "No valid diamonds found. Please check your file contains the 7 mandatory fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "❌ Authentication Error",
        description: "Unable to identify user. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    hapticFeedback.impact('heavy');

    try {
      console.log(`📤 Uploading ${processedData.validRows.length} diamonds for user ${user.id}`);

      // Build JSON payload with all valid diamonds
      const payload = {
        diamonds: processedData.validRows
      };

      console.log('📤 Sending diamonds to batch API:', payload);

      // Send POST request to the FastAPI endpoint with the actual user ID
      const response = await fetch(
        `https://api.mazalbot.com/api/v1/diamonds/batch?user_id=${user.id}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', result);
        throw new Error(`Upload failed: ${result.detail || result.message || 'Unknown error'}`);
      }

      console.log('✅ Batch upload result:', result);

      hapticFeedback.notification('success');
      toast({
        title: "✅ Upload Successful!",
        description: `Successfully uploaded ${processedData.validRows.length} diamonds. ${processedData.failedRows.length} rows were skipped due to missing mandatory fields.`,
      });
      
      // Reset form
      setSelectedFile(null);
      resetProcessor();
    } catch (error) {
      console.error('❌ Batch upload failed:', error);
      hapticFeedback.notification('error');
      toast({
        title: "❌ Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload diamonds",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  // Configure Telegram Main Button for upload
  useTelegramMainButton({
    text: processedData ? `Upload ${processedData.validRows.length} Diamonds` : "Select CSV File",
    isVisible: !!selectedFile,
    isEnabled: !!processedData && processedData.validRows.length > 0 && !isProcessing,
    color: "#0088cc",
    onClick: handleBulkUpload
  });

  async function handleFileChange(file: File | null) {
    console.log('🔄 File change triggered:', file?.name);
    
    if (!file) {
      setSelectedFile(null);
      resetProcessor();
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    hapticFeedback.impact('light');

    try {
      console.log('📂 Processing file:', file.name, 'Size:', file.size);
      await processFile(file);
      console.log('✅ File processed successfully');
      
      hapticFeedback.notification('success');
      toast({
        title: "File Processed",
        description: `Found ${processedData?.validRows.length || 0} diamonds with all mandatory fields. ${processedData?.failedRows.length || 0} rows were skipped.`,
      });
    } catch (error) {
      console.error('❌ File processing error:', error);
      hapticFeedback.notification('error');
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  }

  const resetForm = () => {
    setSelectedFile(null);
    resetProcessor();
    setUploadProgress(0);
    setUploadedCount(0);
    setFailedCount(0);
    setErrors([]);
    hapticFeedback.selection();
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <BulkFileUploadArea
        selectedFile={selectedFile}
        onFileChange={handleFileChange}
        onReset={resetForm}
        isProcessing={isProcessing}
      />

      {/* Processing Progress */}
      {isProcessing && (
        <BulkUploadProgress 
          progress={uploadProgress}
          uploadedCount={uploadedCount}
          totalCount={processedData?.validRows.length || 0}
          failedCount={failedCount}
          errors={errors}
          isUploading={isProcessing}
        />
      )}

      {/* Processing Report */}
      {processedData?.processingReport && !isProcessing && (
        <ProcessingReport 
          report={processedData.processingReport}
          onDownloadFailed={downloadFailedRecords}
          hasFailedRecords={processedData.failedRows?.length > 0}
        />
      )}

      {/* Validation Results */}
      {validationResults && !isProcessing && (
        <CsvValidationResults results={validationResults} />
      )}

      {/* Desktop Upload Button (Mobile uses Telegram Main Button) */}
      {processedData && !isProcessing && (
        <Card className="sm:block hidden">
          <CardContent className="pt-6">
            <Button
              onClick={handleBulkUpload}
              disabled={processedData.validRows.length === 0}
              className="w-full"
              size="lg"
            >
              Upload {processedData.validRows.length} Diamonds
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
