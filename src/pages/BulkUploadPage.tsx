import { useState } from "react";
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { BulkFileUploadArea } from "@/components/upload/BulkFileUploadArea";
import { CsvValidationResults } from "@/components/upload/CsvValidationResults";
import { ProcessingReport } from "@/components/upload/ProcessingReport";
import { UploadResultsReport } from "@/components/upload/UploadResultsReport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertTriangle, Send } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useBulkCsvProcessor } from "@/hooks/useBulkCsvProcessor";
import { useToast } from "@/hooks/use-toast";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { api } from "@/lib/api/client";

export default function BulkUploadPage() {
  const { hapticFeedback } = useTelegramWebApp();
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { processedData, validationResults, processFile, resetProcessor, downloadFailedRecords } = useBulkCsvProcessor();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    successCount: number;
    failureCount: number;
    totalAttempted: number;
    errors: Array<{ row: number; error: string; data: any }>;
    uploadedDiamonds?: any[]; // Add this field for analytics
  } | null>(null);

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setIsProcessing(true);
      try {
        await processFile(file);
        toast({
          title: "File processed successfully",
          description: `Found ${processedData?.validRows.length || 0} valid diamonds ready for upload.`,
        });
        hapticFeedback?.notification('success');
      } catch (error) {
        toast({
          title: "Processing failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
        hapticFeedback?.notification('error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    resetProcessor();
    setIsProcessing(false);
    setIsUploading(false);
    setUploadResults(null);
  };

  const handleUpload = async () => {
    if (!processedData?.validRows.length || !user?.id) {
      toast({
        title: "Cannot upload",
        description: "No valid data to upload or user not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    hapticFeedback?.impact('medium');

    try {
      // Transform data for API - match exact FastAPI schema
      const diamondsData = processedData.validRows.map(row => ({
        stock: row.stock || `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        shape: row.shape,
        weight: parseFloat(row.weight),
        color: row.color,
        clarity: row.clarity,
        cut: row.cut || 'EXCELLENT',
        certificate_number: parseInt(row.certificate_number) || 0,
        certificate_comment: row.certificate_comment || '',
        lab: row.lab || 'GIA',
        length: parseFloat(row.length) || 6.5,
        width: parseFloat(row.width) || 6.5,
        depth: parseFloat(row.depth) || 4.0,
        ratio: parseFloat(row.ratio) || 1.0,
        table: parseInt(row.table) || 60,
        depth_percentage: parseFloat(row.depth_percentage) || 62,
        fluorescence: row.fluorescence,
        polish: row.polish || 'EXCELLENT',
        symmetry: row.symmetry || 'EXCELLENT',
        gridle: row.gridle || 'Medium',
        culet: row.culet || 'NONE',
        price_per_carat: parseInt(row.price_per_carat) || 5000,
        rapnet: parseInt(row.rapnet) || 0,
        picture: row.picture || ''
      }));

      const response = await api.post(`/api/v1/diamonds/batch?user_id=${user.id}`, {
        diamonds: diamondsData
      });

      if (response.data) {
        // Parse response to get detailed results
        const results = response.data as any;
        const successCount = results?.success_count || diamondsData.length;
        const failureCount = results?.failure_count || 0;
        const errors = results?.failed_items || [];

        setUploadResults({
          successCount,
          failureCount,
          totalAttempted: diamondsData.length,
          errors: errors.map((error: any, index: number) => ({
            row: index + 1,
            error: error.error || 'Unknown error',
            data: error.data || {}
          })),
          uploadedDiamonds: diamondsData.slice(0, successCount) // Include uploaded diamonds for analytics
        });

        toast({
          title: `✅ Upload completed!`,
          description: `${successCount} diamonds uploaded successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}.`,
        });
        hapticFeedback?.notification('success');
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "❌ Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload diamonds. Please try again.",
        variant: "destructive",
      });
      hapticFeedback?.notification('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <TelegramLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Bulk CSV Upload
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Upload multiple diamonds at once using CSV or Excel files
          </p>
        </div>

        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-800">7 Mandatory Fields Required</h3>
            <p className="text-sm text-amber-700">
              Each diamond must have: <strong>Certificate ID, Color, Cut, Weight (Carat), Clarity, Fluorescence, Shape</strong>. 
              Rows missing any of these fields will be skipped. You can add other optional fields like Price, Polish, Symmetry, etc.
            </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Area */}
        <BulkFileUploadArea
          selectedFile={selectedFile}
          onFileChange={handleFileChange}
          onReset={handleReset}
          isProcessing={isProcessing}
        />

        {/* Processing Report */}
        {processedData && validationResults && (
          <ProcessingReport
            report={validationResults.processingReport}
            onDownloadFailed={downloadFailedRecords}
            hasFailedRecords={processedData.failedRows.length > 0}
          />
        )}

        {/* Validation Results */}
        {validationResults && (
          <CsvValidationResults results={validationResults} />
        )}

        {/* Upload Results */}
        {uploadResults && (
          <UploadResultsReport 
            results={uploadResults}
            onReset={handleReset}
          />
        )}

        {/* Upload Button */}
        {processedData?.validRows.length > 0 && !uploadResults && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Ready to upload {processedData.validRows.length} diamonds to your inventory
                </p>
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : `Upload ${processedData.validRows.length} Diamonds`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TelegramLayout>
  );
}
