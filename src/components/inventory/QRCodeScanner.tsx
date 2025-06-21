
import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeScannerProps {
  onScanSuccess: (giaData: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRCodeScanner({ onScanSuccess, onClose, isOpen }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const processWithOCR = async (imageData: string) => {
    try {
      setIsFetchingGIA(true);
      toast({
        title: "Processing with OCR",
        description: "Analyzing image for GIA certificate data...",
      });

      const { data, error } = await supabase.functions.invoke('fetch-gia-data', {
        body: { 
          imageData,
          useOCR: true 
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to process image with OCR');
      }

      if (data) {
        onScanSuccess(data);
        stopScanning();
        toast({
          title: "Success",
          description: "GIA certificate data extracted successfully",
        });
      } else {
        throw new Error('No data extracted from image');
      }

    } catch (error) {
      console.error('Error processing with OCR:', error);
      toast({
        variant: "destructive",
        title: "OCR Processing Failed",
        description: error instanceof Error ? error.message : "Failed to extract certificate data from image",
      });
    } finally {
      setIsFetchingGIA(false);
    }
  };

  const startScanning = async () => {
    if (!videoRef.current || !readerRef.current) return;

    try {
      setIsScanning(true);
      setError(null);
      setIsLoading(true);

      const videoInputDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = videoInputDevices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        throw new Error('No camera devices found');
      }

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
              console.error('QR processing failed, trying OCR fallback:', err);
              // If QR fails, try OCR as fallback
              const imageData = captureFrame();
              if (imageData) {
                await processWithOCR(imageData);
              } else {
                toast({
                  variant: "destructive",
                  title: "Scan Error",
                  description: "Failed to process QR code and capture image for OCR",
                });
              }
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        await processWithOCR(imageData);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Failed to process uploaded image",
      });
    }
  };

  const handleQRScan = async (qrText: string) => {
    try {
      const certificateNumber = extractCertificateNumber(qrText);
      
      if (!certificateNumber) {
        throw new Error("Invalid GIA QR code format");
      }

      setIsFetchingGIA(true);
      toast({
        title: "Fetching GIA Data",
        description: "Getting diamond information from GIA database...",
      });

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
      throw error; // Re-throw to trigger OCR fallback
    } finally {
      setIsFetchingGIA(false);
    }
  };

  const extractCertificateNumber = (qrText: string): string | null => {
    try {
      if (qrText.includes('gia.edu') || qrText.includes('gia.org')) {
        const urlMatch = qrText.match(/reportno[=\/](\d+)/i);
        if (urlMatch) {
          return urlMatch[1];
        }
      }

      const numberMatch = qrText.match(/^\d{10,}$/);
      if (numberMatch) {
        return numberMatch[0];
      }

      try {
        const jsonData = JSON.parse(qrText);
        return jsonData.certificate || jsonData.certificateNumber || jsonData.reportNumber;
      } catch {
        // Continue with other parsing methods
      }

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

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan GIA Certificate
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
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            {(isLoading || isFetchingGIA) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                <p className="text-white text-sm text-center">
                  {isFetchingGIA ? 'Processing certificate data...' : 'Starting camera...'}
                </p>
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          
          <div className="flex gap-2">
            {!isScanning ? (
              <>
                <Button onClick={startScanning} className="flex-1" disabled={isFetchingGIA}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
                <Button onClick={triggerFileUpload} variant="outline" className="flex-1" disabled={isFetchingGIA}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </>
            ) : (
              <Button onClick={stopScanning} variant="outline" className="flex-1" disabled={isFetchingGIA}>
                Stop Scanning
              </Button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <p className="text-sm text-gray-600 text-center">
            Scan a GIA QR code or upload an image of a GIA certificate. The system will automatically extract diamond data using OCR if needed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
