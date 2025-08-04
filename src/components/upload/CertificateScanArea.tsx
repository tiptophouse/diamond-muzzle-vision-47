
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, Scan } from 'lucide-react';
import { DiamondFormData } from '@/components/inventory/form/types';

interface CertificateScanAreaProps {
  onScanResult: (data: Partial<DiamondFormData>) => void;
}

export function CertificateScanArea({ onScanResult }: CertificateScanAreaProps) {
  const [scanning, setScanning] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanning(true);

    try {
      // Mock OCR data extraction - replace with actual OCR service
      setTimeout(() => {
        const mockData: Partial<DiamondFormData> = {
          certificateNumber: '1234567890',
          shape: 'Round',
          carat: 1.23,
          color: 'G',
          clarity: 'VS1',
          cut: 'Excellent',
          lab: 'GIA'
        };
        onScanResult(mockData);
        setScanning(false);
      }, 2000);
    } catch (error) {
      console.error('OCR failed:', error);
      setScanning(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardContent className="p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Scan className="h-8 w-8 text-primary" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Scan GIA Certificate</h3>
          <p className="text-muted-foreground text-sm">
            Upload a photo of your certificate to auto-fill diamond details
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            disabled={scanning}
            onClick={() => document.getElementById('certificate-scan')?.click()}
            className="w-full"
          >
            <Camera className="w-4 h-4 mr-2" />
            {scanning ? 'Scanning...' : 'Take Photo'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            disabled={scanning}
            onClick={() => document.getElementById('certificate-upload')?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>

        <input
          id="certificate-scan"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
        />
        
        <input
          id="certificate-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </CardContent>
    </Card>
  );
}
