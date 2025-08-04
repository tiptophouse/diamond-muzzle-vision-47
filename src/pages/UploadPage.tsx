
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Scan, FileText, Sparkles, ArrowLeft } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { SingleStoneForm } from '@/components/upload/SingleStoneForm';
import { CertificateScanArea } from '@/components/upload/CertificateScanArea';
import { BulkUploadForm } from '@/components/upload/BulkUploadForm';
import { DiamondFormData } from '@/components/inventory/form/types';
import { useInventoryCrud } from '@/hooks/useInventoryCrud';

export default function UploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { backButton, hapticFeedback } = useTelegramWebApp();
  const { user } = useTelegramAuth();
  const { addDiamond, isLoading } = useInventoryCrud({
    onSuccess: () => {
      hapticFeedback.notification('success');
      navigate('/inventory');
    }
  });

  const action = searchParams.get('action');
  const [scannedData, setScannedData] = useState<Partial<DiamondFormData> | null>(null);

  React.useEffect(() => {
    backButton.show(() => {
      if (action) {
        navigate('/upload');
      } else {
        navigate('/dashboard');
      }
    });

    return () => backButton.hide();
  }, [action, navigate, backButton]);

  const handleFormSubmit = async (data: DiamondFormData) => {
    await addDiamond(data);
  };

  const handleScanResult = (data: Partial<DiamondFormData>) => {
    console.log('📷 Scan result received:', data);
    setScannedData(data);
    hapticFeedback.impact('light');
  };

  // Show single stone form when action=scan or when we have scanned data
  if (action === 'scan' || scannedData) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Add Diamond</h1>
            <p className="text-muted-foreground">
              {scannedData ? 'Review and complete the details' : 'Enter diamond details manually'}
            </p>
          </div>
          
          {!scannedData && (
            <CertificateScanArea onScanResult={handleScanResult} />
          )}
          
          <SingleStoneForm
            initialData={scannedData || undefined}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  // Show bulk upload form when action=bulk
  if (action === 'bulk') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Bulk Upload</h1>
            <p className="text-muted-foreground">
              Upload multiple diamonds using CSV or Excel files
            </p>
          </div>
          
          <BulkUploadForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Upload Inventory</h1>
            <p className="text-muted-foreground mt-2">
              Choose how you'd like to add diamonds to your inventory
            </p>
          </div>
        </div>

        {/* Upload Options */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Single Stone Upload */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => navigate('/upload?action=scan')}>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Scan className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Add Single Diamond</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Scan certificate or add manually with AI assistance
                </p>
              </div>
              <Button variant="outline" className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Adding
              </Button>
            </CardContent>
          </Card>

          {/* Bulk Upload - Now Enabled */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => navigate('/upload?action=bulk')}>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Bulk Upload</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload CSV/Excel files with multiple diamonds
                </p>
              </div>
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV/Excel
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="bg-muted/5 border-muted/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Need Help?
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Use single diamond upload for precise control and AI assistance</p>
              <p>• Scan GIA/GCAL certificates for instant data extraction</p>
              <p>• Use bulk upload for CSV/Excel files with multiple diamonds</p>
              <p>• All uploads sync instantly across dashboard and store using FastAPI</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
