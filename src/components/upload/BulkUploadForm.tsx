import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";
import { BulkFileUploadArea } from "./BulkFileUploadArea";
import { CsvValidationResults } from "./CsvValidationResults";
import { BulkUploadProgress } from "./BulkUploadProgress";
import { ProcessingReport } from "./ProcessingReport";
import { useBulkCsvProcessor } from "@/hooks/useBulkCsvProcessor";

export function BulkUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();
  const { processedData, validationResults, processFile, resetProcessor, downloadFailedRecords } = useBulkCsvProcessor();

  // All required fields for the API - every field must be present
  const requiredFields = [
    'stock', 'shape', 'weight', 'color', 'clarity', 'lab', 'certificate_number',
    'length', 'width', 'depth', 'ratio', 'cut', 'polish', 'symmetry', 
    'fluorescence', 'table', 'depth_percentage', 'gridle', 'culet', 
    'certificate_comment', 'rapnet', 'price_per_carat', 'picture'
  ];

  async function handleBulkUpload() {
    if (!processedData?.validRows.length) return;

    setIsProcessing(true);
    hapticFeedback.impact('heavy');

    try {
      // Filter rows to only include those with ALL required fields present
      const validDiamonds = processedData.validRows.filter(row => {
        return requiredFields.every(field => {
          const value = row[field];
          // All fields must be present and not empty
          return value !== undefined && value !== null && value !== '';
        });
      });

      console.log(`📋 Filtered ${validDiamonds.length} complete diamonds from ${processedData.validRows.length} total rows`);

      if (validDiamonds.length === 0) {
        toast({
          title: "❌ No Complete Diamonds",
          description: "No diamonds have all required fields. Please check your CSV file contains all 22 required fields.",
          variant: "destructive",
        });
        return;
      }

      // Build JSON payload
      const payload = {
        diamonds: validDiamonds
      };

      console.log('📤 Sending diamonds to batch API:', payload);

      // Send POST request to the specific API endpoint
      const response = await fetch(
        'https://api.mazalbot.com/api/v1/diamonds/batch?user_id=6485315240',
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Batch upload result:', result);

      hapticFeedback.notification('success');
      toast({
        title: "✅ Upload Successful!",
        description: `Successfully uploaded ${validDiamonds.length} diamonds to the batch API`,
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
    if (!file) {
      setSelectedFile(null);
      resetProcessor();
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    hapticFeedback.impact('light');

    try {
      await processFile(file);
      hapticFeedback.notification('success');
      toast({
        title: "File Processed",
        description: "CSV file has been analyzed and validated",
      });
    } catch (error) {
      hapticFeedback.notification('error');
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process CSV file",
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
      {isProcessing && <BulkUploadProgress />}

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
