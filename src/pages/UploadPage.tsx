import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CSVReader } from 'react-papaparse';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { UploadCloud, File, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { UploadProgress } from '@/components/upload/UploadProgress';
import { UploadResult } from '@/components/upload/UploadResult';
import { ProcessingSteps } from '@/components/upload/ProcessingSteps';
import { ProcessingReport } from '@/components/upload/ProcessingReport';
import { UploadSuccessCard } from '@/components/upload/UploadSuccessCard';
import { useBulkUploadNotifications } from '@/hooks/useBulkUploadNotifications';
import { useToast } from '@/components/ui/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useFeedback } from '@/components/feedback/FeedbackProvider';

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [failedRecords, setFailedRecords] = useState<any[]>([]);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const { sendBulkUploadNotification } = useBulkUploadNotifications();
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { trackAction, trackFeatureUsage } = useFeedback();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setCsvData([]);
    setUploadResult(null);
    setFailedRecords([]);
    setUploadProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  const handleManualUpload = async (data: any[]) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(5);
    setUploadResult(null);
    setFailedRecords([]);

    try {
      // Simulate processing steps
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(20);

      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(30);

      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(70);

      // Upload data to API
      setUploadProgress(80);
      const response = await api.uploadCsv(apiEndpoints.uploadCsv, data, user.id);

      if (response.error) {
        throw new Error(response.error);
      }

      setUploadProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));

      setUploadProgress(95);
      const { processed, success, failed, errors } = response.data as any;

      setUploadProgress(100);
      setUploadResult({
        success: true,
        message: `Successfully processed ${processed} diamonds`,
        processedCount: processed,
        errors: errors,
      });

      setFailedRecords(failed);

      // Send bulk upload notification
      sendBulkUploadNotification({
        diamondCount: processed,
        uploadType: 'manual'
      });

      // Track successful upload for feedback triggers
      trackAction('successful_uploads');
      trackFeatureUsage('bulk_upload', true, { 
        stones_count: processed || 1,
        upload_method: 'manual'
      });

      setShowSuccessCard(true);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadResult({
        success: false,
        message: error.message || "Upload failed",
      });

      // Track failed upload
      trackFeatureUsage('bulk_upload', false, { 
        error: error.message 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (results: any) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(5);
    setUploadResult(null);
    setFailedRecords([]);

    try {
      // Simulate processing steps
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(20);

      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(30);

      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(70);

      // Upload data to API
      setUploadProgress(80);
      const parsedData = results.data.filter((row: any) => row.length > 0);
      const response = await api.uploadCsv(apiEndpoints.uploadCsv, parsedData, user.id);

      if (response.error) {
        throw new Error(response.error);
      }

      setUploadProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));

      setUploadProgress(95);
      const { processed, success, failed, errors } = response.data as any;

      setUploadProgress(100);
      setUploadResult({
        success: true,
        message: `Successfully processed ${processed} diamonds`,
        processedCount: processed,
        errors: errors,
      });

      setFailedRecords(failed);

      // Send bulk upload notification
      sendBulkUploadNotification({
        diamondCount: processed,
        uploadType: 'csv'
      });

      // Track successful upload for feedback triggers
      trackAction('successful_uploads');
      trackFeatureUsage('bulk_upload', true, { 
        stones_count: processed || 1,
        upload_method: 'csv'
      });

      setShowSuccessCard(true);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadResult({
        success: false,
        message: error.message || "Upload failed",
      });

      // Track failed upload
      trackFeatureUsage('bulk_upload', false, { 
        error: error.message 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleExcelUpload = async (file: File) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(5);
    setUploadResult(null);
    setFailedRecords([]);

    try {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Simulate processing steps
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(20);

        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(30);

        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(70);

        // Upload data to API
        setUploadProgress(80);
        const response = await api.uploadCsv(apiEndpoints.uploadCsv, jsonData, user.id);

        if (response.error) {
          throw new Error(response.error);
        }

        setUploadProgress(90);
        await new Promise(resolve => setTimeout(resolve, 500));

        setUploadProgress(95);
        const { processed, success, failed, errors } = response.data as any;

        setUploadProgress(100);
        setUploadResult({
          success: true,
          message: `Successfully processed ${processed} diamonds`,
          processedCount: processed,
          errors: errors,
        });

        setFailedRecords(failed);

        // Send bulk upload notification
        sendBulkUploadNotification({
          diamondCount: processed,
          uploadType: 'csv'
        });

        // Track successful upload for feedback triggers
        trackAction('successful_uploads');
        trackFeatureUsage('bulk_upload', true, { 
          stones_count: processed || 1,
          upload_method: 'csv'
        });

        setShowSuccessCard(true);
      };
      reader.onerror = (error) => {
        console.error("Error reading Excel file:", error);
        setUploadResult({
          success: false,
          message: "Error reading Excel file",
        });

        // Track failed upload
        trackFeatureUsage('bulk_upload', false, { 
          error: error.message 
        });
      };
      reader.onloadstart = () => setUploadProgress(10);
      reader.onloadend = () => setUploadProgress(20);
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadResult({
        success: false,
        message: error.message || "Upload failed",
      });

      // Track failed upload
      trackFeatureUsage('bulk_upload', false, { 
        error: error.message 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setCsvData([]);
    setUploadResult(null);
    setFailedRecords([]);
    setUploadProgress(0);
  };

  const handleDownloadFailed = () => {
    const csv = convertArrayToCSV(failedRecords);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'failed_records.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const convertArrayToCSV = (array: any[]) => {
    const header = array.length > 0 ? Object.keys(array[0]).join(',') : '';
    const rows = array.map(obj => Object.values(obj).join(','));
    return `${header}\n${rows.join('\n')}`;
  };

  const handleContinue = () => {
    setShowSuccessCard(false);
    setFile(null);
    setCsvData([]);
    setUploadResult(null);
    setFailedRecords([]);
    setUploadProgress(0);
  };

  const handleShare = () => {
    toast({
      title: "שתף את ההעלאה שלך",
      description: "שתף את ההעלאה שלך עם קהילת היהלומים",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Upload Diamonds</h1>

      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center ${isDragActive ? 'border-primary' : 'border-muted'
            }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            {isDragActive
              ? 'Drop the file here...'
              : 'Drag and drop a CSV/XLSX file here, or click to select a file'}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border rounded-md mb-4">
          <div className="flex items-center">
            <File className="h-4 w-4 mr-2" />
            <p className="text-sm">{file.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}

      {file && file.name.endsWith('.csv') && (
        <CSVReader
          onUploadAccepted={(results: any) => {
            console.log('CSV Results:', results);
            handleFileUpload(results);
          }}
          onError={(error: any) => {
            console.error('CSV Error:', error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Error parsing CSV file",
            });
          }}
          config={{
            header: false,
          }}
        >
          <Button>
            Parse CSV
          </Button>
        </CSVReader>
      )}

      {file && (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) && (
        <Button onClick={() => handleExcelUpload(file)}>
          Upload Excel File
        </Button>
      )}

      <UploadProgress progress={uploadProgress} uploading={uploading} />
      <ProcessingSteps progress={uploadProgress} uploading={uploading} />
      <UploadResult result={uploadResult} />

      {uploadResult?.success && failedRecords.length > 0 && (
        <ProcessingReport
          report={{
            totalProcessed: uploadResult.processedCount || 0,
            successCount: (uploadResult.processedCount || 0) - failedRecords.length,
            failureCount: failedRecords.length,
            fileType: file?.name.split('.').pop() || 'CSV',
            processingTime: 1000,
            aiExtracted: true,
          }}
          onDownloadFailed={handleDownloadFailed}
          hasFailedRecords={failedRecords.length > 0}
        />
      )}

      {showSuccessCard && (
        <UploadSuccessCard
          onContinue={handleContinue}
          onShare={handleShare}
        />
      )}
    </div>
  );
};

export default UploadPage;
