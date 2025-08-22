
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadDropzone } from './FileUploadDropzone';
import { CSVPreview } from './CSVPreview';
import { BulkUploadProgress } from './BulkUploadProgress';
import { SingleStoneUploadForm } from './SingleStoneUploadForm';
import { useBulkUpload } from '@/hooks/useBulkUpload';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Diamond, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UploadWizardProps {
  onSuccess?: () => void;
  showBulkUpload?: boolean;
}

export function UploadWizard({ onSuccess, showBulkUpload = true }: UploadWizardProps) {
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'processing' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'bulk' | 'single'>('bulk');
  
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { uploadDiamonds, isUploading } = useBulkUpload();

  const handleFileSelect = (file: File, data: any[]) => {
    setCsvFile(file);
    setCsvData(data);
    setCurrentStep('preview');
    setErrors([]);
  };

  const handlePreviewConfirm = async () => {
    if (!user?.id || !csvData.length) return;

    setCurrentStep('processing');
    setUploadProgress(0);
    setUploadedCount(0);
    setFailedCount(0);
    setErrors([]);

    try {
      const result = await uploadDiamonds(csvData, user.id, (progress) => {
        setUploadProgress(progress.percentage);
        setUploadedCount(progress.completed);
        setFailedCount(progress.failed);
        if (progress.errors) {
          setErrors(prev => [...prev, ...progress.errors]);
        }
      });

      if (result.success) {
        setCurrentStep('complete');
        toast({
          title: "🎉 Upload Complete!",
          description: `Successfully uploaded ${result.successCount} diamonds. ${result.failCount > 0 ? `${result.failCount} failed.` : ''}`,
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "An error occurred during upload. Please try again.",
        variant: "destructive",
      });
      setCurrentStep('upload');
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setCsvData([]);
    setCsvFile(null);
    setUploadProgress(0);
    setUploadedCount(0);
    setFailedCount(0);
    setErrors([]);
  };

  const handleSingleStoneSuccess = () => {
    toast({
      title: "✅ Diamond Added",
      description: "Individual diamond has been successfully added to your inventory.",
    });
    
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleViewDashboard = () => {
    navigate(`/dashboard?upload_success=${uploadedCount}&from=bulk_upload`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Upload className="h-8 w-8 text-[#0088cc]" />
          <h1 className="text-2xl font-bold">Upload Diamonds</h1>
        </div>
        <p className="text-muted-foreground">
          Add diamonds to your inventory via CSV upload or individual entry
        </p>
      </div>

      {showBulkUpload ? (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'bulk' | 'single')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bulk" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Bulk Upload</span>
            </TabsTrigger>
            <TabsTrigger value="single" className="flex items-center space-x-2">
              <Diamond className="h-4 w-4" />
              <span>Single Diamond</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bulk" className="space-y-6">
            {currentStep === 'upload' && (
              <FileUploadDropzone
                onFileSelect={handleFileSelect}
                accept=".csv,.xlsx,.xls"
                maxSize={10 * 1024 * 1024}
              />
            )}

            {currentStep === 'preview' && csvData.length > 0 && (
              <CSVPreview
                data={csvData}
                fileName={csvFile?.name || 'Unknown'}
                onConfirm={handlePreviewConfirm}
                onCancel={handleReset}
              />
            )}

            {currentStep === 'processing' && (
              <div className="space-y-4">
                <div className="text-center">
                  <Progress value={uploadProgress} className="mb-4" />
                  <p>Uploading {uploadedCount} of {csvData.length} diamonds...</p>
                </div>
              </div>
            )}

            {currentStep === 'complete' && (
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <CardTitle className="text-green-600">Upload Complete!</CardTitle>
                  <CardDescription>
                    Your diamonds have been successfully uploaded to your inventory
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{uploadedCount}</div>
                      <div className="text-sm text-green-700">Uploaded</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={handleViewDashboard} className="bg-[#0088cc] hover:bg-[#0088cc]/90">
                      View Dashboard
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      Upload More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="single" className="space-y-6">
            <SingleStoneUploadForm onSuccess={handleSingleStoneSuccess} />
          </TabsContent>
        </Tabs>
      ) : (
        <SingleStoneUploadForm onSuccess={handleSingleStoneSuccess} />
      )}
    </div>
  );
}
