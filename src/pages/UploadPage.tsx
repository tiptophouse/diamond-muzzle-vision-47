
import React from 'react';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { CsvBulkUploadValidator } from '@/components/upload/CsvBulkUploadValidator';
import { useToast } from '@/hooks/use-toast';

export default function UploadPage() {
  const { toast } = useToast();

  const handleUploadSuccess = (data: any[], validationResult: any) => {
    console.log('Upload successful:', { data, validationResult });
    
    // Here you would typically send the data to your FastAPI backend
    // For now, we'll just show a success message
    toast({
      title: "🎉 Diamonds Uploaded Successfully!",
      description: `${validationResult.validRows} diamonds have been added to your inventory.`,
    });
  };

  return (
    <TelegramLayout>
      <div className="container mx-auto p-4 space-y-6 pb-safe">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Bulk Diamond Upload</h1>
          <p className="text-muted-foreground">
            Upload your diamond inventory using our comprehensive CSV validator
          </p>
        </div>
        
        <CsvBulkUploadValidator onUploadSuccess={handleUploadSuccess} />
      </div>
    </TelegramLayout>
  );
}
