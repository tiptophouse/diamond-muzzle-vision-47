import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeScannerProps {
  onScanSuccess: (giaData: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRCodeScanner({ onScanSuccess, onClose, isOpen }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingGIA, setIsFetchingGIA] = useState(false);
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

      // Get available video input devices
      const videoInputDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = videoInputDevices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        throw new Error('No camera devices found');
      }

      // Prefer back camera if available
      const backCamera = cameras.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      const selectedDeviceId = backCamera ? backCamera.deviceId : cameras[0].deviceId;

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
      const certificateNumber = extractCertificateNumber(qrText);
      
      if (!certificateNumber) {
        toast({
          variant: "destructive",
          title: "Invalid QR Code",
          description: "This doesn't appear to be a valid GIA diamond QR code",
        });
        return;
      }

      setIsFetchingGIA(true);
      toast({
        title: "Fetching GIA Data",
        description: "Getting diamond information from GIA database...",
      });

      // Call our edge function to fetch GIA data
      const { data, error } = await supabase.functions.invoke('fetch-gia-data', {
        body: { certificateNumber }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch GIA data');
      }

      if (data) {
        onScanSuccess(data);
        stopScanning();
        toast({
          title: "Success",
          description: "GIA diamond information loaded successfully",
        });
      } else {
        throw new Error('No data received from GIA');
      }

    } catch (error) {
      console.error('Error fetching GIA data:', error);
      toast({
        variant: "destructive",
        title: "Fetch Error",
        description: error instanceof Error ? error.message : "Failed to fetch GIA information",
      });
    } finally {
      setIsFetchingGIA(false);
    }
  };

  const extractCertificateNumber = (qrText: string): string | null => {
    try {
      // Check if it's a GIA URL
      if (qrText.includes('gia.edu') || qrText.includes('gia.org')) {
        const urlMatch = qrText.match(/reportno[=\/](\d+)/i);
        if (urlMatch) {
          return urlMatch[1];
        }
      }

      // Check if it's just a certificate number
      const numberMatch = qrText.match(/^\d{10,}$/);
      if (numberMatch) {
        return numberMatch[0];
      }

      // Try to extract from structured data
      try {
        const jsonData = JSON.parse(qrText);
        return jsonData.certificate || jsonData.certificateNumber || jsonData.reportNumber;
      } catch {
        // Continue with other parsing methods
      }

      // Look for certificate patterns in text
      const certMatch = qrText.match(/(?:certificate|cert|report)[\s:]*(\d{10,})/i);
      if (certMatch) {
        return certMatch[1];
      }

      return null;
    } catch (error) {
      console.error('Error extracting certificate number:', error);
      return null;
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
    setIsFetchingGIA(false);
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
            {(isLoading || isFetchingGIA) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                <p className="text-white text-sm">
                  {isFetchingGIA ? 'Fetching GIA data...' : 'Starting camera...'}
                </p>
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          
          <div className="flex gap-2">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1" disabled={isFetchingGIA}>
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline" className="flex-1" disabled={isFetchingGIA}>
                Stop Scanning
              </Button>
            )}
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            Position the GIA QR code within the camera frame. The system will automatically fetch real diamond data from GIA's database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
