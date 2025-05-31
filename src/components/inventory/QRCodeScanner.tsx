
import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface QRCodeScannerProps {
  onScanSuccess: (giaData: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRCodeScanner({ onScanSuccess, onClose, isOpen }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen && !readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader();
    }

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [isOpen]);

  const startScanning = async () => {
    if (!videoRef.current || !readerRef.current) return;

    try {
      setIsScanning(true);
      setError(null);
      setIsLoading(true);

      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

      setIsLoading(false);

      readerRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        async (result, error) => {
          if (result) {
            const qrText = result.getText();
            console.log('QR Code scanned:', qrText);
            
            try {
              await handleQRScan(qrText);
            } catch (err) {
              console.error('Error processing QR code:', err);
              toast({
                variant: "destructive",
                title: "Scan Error",
                description: "Failed to process GIA information from QR code",
              });
            }
          }
        }
      );
    } catch (err) {
      setIsLoading(false);
      setError('Failed to start camera. Please ensure camera permissions are granted.');
      console.error('Camera start error:', err);
    }
  };

  const handleQRScan = async (qrText: string) => {
    try {
      const giaData = parseGIAQRCode(qrText);
      
      if (giaData) {
        onScanSuccess(giaData);
        stopScanning();
        toast({
          title: "Success",
          description: "GIA information successfully loaded from QR code",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid QR Code",
          description: "This doesn't appear to be a valid GIA diamond QR code",
        });
      }
    } catch (error) {
      console.error('Error parsing GIA QR code:', error);
      toast({
        variant: "destructive",
        title: "Parse Error",
        description: "Failed to parse GIA information from QR code",
      });
    }
  };

  const parseGIAQRCode = (qrText: string) => {
    try {
      if (qrText.includes('gia.edu') || qrText.includes('gia.org')) {
        const certMatch = qrText.match(/certificate[\/=](\d+)/i);
        if (certMatch) {
          return {
            stockNumber: `GIA-${certMatch[1]}`,
            certificateNumber: certMatch[1],
            lab: 'GIA',
            status: 'Available'
          };
        }
      }
      
      try {
        const jsonData = JSON.parse(qrText);
        if (jsonData.certificate || jsonData.gia || jsonData.diamond) {
          return {
            stockNumber: jsonData.stockNumber || `GIA-${Date.now()}`,
            shape: jsonData.shape || jsonData.diamond?.shape || 'Round',
            carat: parseFloat(jsonData.carat || jsonData.diamond?.weight || jsonData.weight || '1.0'),
            color: jsonData.color || jsonData.diamond?.color || 'G',
            clarity: jsonData.clarity || jsonData.diamond?.clarity || 'VS1',
            cut: jsonData.cut || jsonData.diamond?.cut || 'Excellent',
            certificateNumber: jsonData.certificate || jsonData.certificateNumber || '',
            lab: 'GIA',
            price: parseFloat(jsonData.price || '5000'),
            status: 'Available'
          };
        }
      } catch {
        // Continue with text parsing
      }
      
      const lines = qrText.split('\n').map(line => line.trim());
      const giaData: any = {
        lab: 'GIA',
        stockNumber: `GIA-${Date.now()}`,
        status: 'Available',
        shape: 'Round',
        carat: 1.0,
        color: 'G',
        clarity: 'VS1',
        cut: 'Excellent',
        price: 5000
      };
      
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('carat') || lowerLine.includes('weight')) {
          const caratMatch = line.match(/(\d+\.?\d*)/);
          if (caratMatch) giaData.carat = parseFloat(caratMatch[1]);
        } else if (lowerLine.includes('color')) {
          const colorMatch = line.match(/([D-Z])/i);
          if (colorMatch) giaData.color = colorMatch[1].toUpperCase();
        } else if (lowerLine.includes('clarity')) {
          const clarityMatch = line.match(/(FL|IF|VVS1|VVS2|VS1|VS2|SI1|SI2|I1|I2|I3)/i);
          if (clarityMatch) giaData.clarity = clarityMatch[1].toUpperCase();
        }
      });
      
      return giaData;
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan GIA QR Code
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-square rounded-lg bg-gray-100"
              autoPlay
              playsInline
              muted
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          
          <div className="flex gap-2">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline" className="flex-1">
                Stop Scanning
              </Button>
            )}
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            Position the GIA QR code within the camera frame to scan
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
