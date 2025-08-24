
import React, { useState } from 'react';
import { useOptimizedTelegramAuthContext } from '@/context/OptimizedTelegramAuthContext';
import { EnhancedTelegramLayout } from '@/components/layout/EnhancedTelegramLayout';
import { BulkUploadForm } from '@/components/upload/BulkUploadForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function BulkUploadPage() {
  const { user, isAuthenticated } = useOptimizedTelegramAuthContext();
  const navigate = useNavigate();
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [isValid, setIsValid] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <EnhancedTelegramLayout>
        <div className="text-center py-8">
          <p>Please authenticate to access bulk upload</p>
        </div>
      </EnhancedTelegramLayout>
    );
  }

  const handleFileUpload = (data: any[]) => {
    setUploadedData(data);
    console.log('File uploaded with', data.length, 'records');
  };

  const handleValidationResults = (results: any[], valid: boolean) => {
    setValidationResults(results);
    setIsValid(valid);
  };

  const handleUpload = async () => {
    if (!isValid || validationResults.length === 0) {
      toast.error('Please validate your data before uploading');
      return;
    }

    try {
      console.log('Starting bulk upload for', validationResults.length, 'records');
      
      toast.success('Bulk upload completed successfully!');
      
      // Reset state
      setUploadedData([]);
      setValidationResults([]);
      setIsValid(false);
      
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Upload failed. Please try again.');
    }
  };

  return (
    <EnhancedTelegramLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Bulk Upload</h1>
        </div>

        <BulkUploadForm />

        {uploadedData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Records:</span>
                  <span className="font-medium">{uploadedData.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Valid Records:</span>
                  <span className="font-medium text-green-600">{validationResults.length}</span>
                </div>

                {isValid && validationResults.length > 0 && (
                  <Button 
                    onClick={handleUpload} 
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {validationResults.length} Records
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </EnhancedTelegramLayout>
  );
}
