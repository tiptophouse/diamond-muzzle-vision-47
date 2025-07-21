
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

  async function handleBulkUpload() {
    if (!processedData?.validRows.length) return;

    setIsProcessing(true);
    hapticFeedback.impact('heavy');

    try {
      // TODO: Phase 2 - Connect to FastAPI /diamonds/batch endpoint
      console.log('📤 Would upload diamonds:', processedData.validRows);
      
      hapticFeedback.notification('success');
      toast({
        title: "Upload Successful!",
        description: `Successfully processed ${processedData.validRows.length} diamonds`,
      });
      
      // Reset form
      setSelectedFile(null);
      resetProcessor();
    } catch (error) {
      hapticFeedback.notification('error');
      toast({
        title: "Upload Failed",
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
