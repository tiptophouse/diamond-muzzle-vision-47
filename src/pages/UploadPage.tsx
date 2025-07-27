
import React from 'react';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { AdvancedCsvBulkUploadValidator } from '@/components/upload/AdvancedCsvBulkUploadValidator';
import { useToast } from '@/hooks/use-toast';

export default function UploadPage() {
  const { toast } = useToast();

  const handleUploadSuccess = (data: any[], validationResult: any) => {
    console.log('🎉 Upload successful:', { 
      uploadedCount: data.length, 
      validationResult,
      sampleDiamond: data[0]
    });
    
    toast({
      title: "🎉 Upload Complete!",
      description: `Successfully uploaded ${validationResult.validRows} diamonds with all required fields. Failed: ${validationResult.failedRows}`,
    });
  };

  return (
    <TelegramLayout>
      <div className="container mx-auto p-4 space-y-6 pb-safe">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">💎 Professional Diamond CSV Upload</h1>
          <p className="text-muted-foreground">
            Upload your diamond inventory with comprehensive validation
          </p>
          <div className="text-sm text-muted-foreground mt-2">
            ✅ 52 Required Columns • 7 Mandatory Fields • 3D URL Support
          </div>
        </div>
        
        <AdvancedCsvBulkUploadValidator onUploadSuccess={handleUploadSuccess} />
      </div>
    </TelegramLayout>
  );
}
