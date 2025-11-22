
import { useRef, useState, useEffect, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseGiaScannerProps {
  onScanSuccess: (giaData: any) => void;
  isOpen: boolean;
}

export function useGiaScanner({ onScanSuccess, isOpen }: UseGiaScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingGIA, setIsFetchingGIA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  const stopScanning = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
    setIsFetchingGIA(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const processWithOCR = useCallback(async (imageData: string) => {
    try {
      setIsFetchingGIA(true);
      
      console.info('[GIA UPLOAD START]', {
        imageSize: imageData.length,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Processing Certificate",
        description: "Extracting diamond data with AI...",
      });

      console.info('[GIA UPLOAD REQUEST]', {
        endpoint: 'extract-gia-data',
        imageDataLength: imageData.length
      });

      const { data, error } = await supabase.functions.invoke('extract-gia-data', {
        body: { imageData }
      });

      if (error) {
        console.error('[GIA UPLOAD FAIL]', {
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw new Error(error.message || 'Failed to extract certificate data');
      }

      console.info('[GIA PARSE RESULT]', {
        success: data?.success,
        hasData: !!data?.data,
        certificateNumber: data?.data?.certificateNumber,
        parsedData: JSON.stringify(data?.data).substring(0, 300)
      });

      if (data?.success && data?.data) {
        // Add certificate URL to the data if it was uploaded
        const enhancedData = {
          ...data.data,
          certificateUrl: data.data.certificate_url || data.data.certificateUrl
        };
        
        console.info('[GIA UPLOAD SUCCESS]', {
          certificateNumber: enhancedData.certificateNumber,
          hasImage: !!enhancedData.certificateUrl
        });
        
        onScanSuccess(enhancedData);
        stopScanning();
        toast({
          title: "✅ GIA Diamond Uploaded",
          description: "Certificate data extracted successfully",
        });
      } else {
        throw new Error('No data extracted from certificate');
      }

    } catch (error) {
      console.error('[GIA UPLOAD FAIL]', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      
      toast({
        variant: "destructive",
        title: "❌ GIA Upload Failed",
        description: error instanceof Error ? error.message : "Failed to extract certificate data",
      });
    } finally {
      setIsFetchingGIA(false);
    }
  }, [onScanSuccess, stopScanning, toast]);
  
  const extractCertificateNumber = useCallback((qrText: string): string | null => {
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
  }, []);

  const handleQRScan = useCallback(async (qrText: string) => {
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
          title: "✅ Success", 
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
  }, [extractCertificateNumber, onScanSuccess, stopScanning, toast]);
  
  const startScanning = useCallback(async () => {
    if (!videoRef.current || !readerRef.current) return;

    try {
      setIsScanning(true);
      setError(null);
      setIsLoading(true);

      // Check if camera access is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this device/browser');
      }

      // Request camera permission first
      console.log('📱 Requesting camera permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' }, // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Stop the stream immediately - we just wanted to check permissions
      stream.getTracks().forEach(track => track.stop());
      
      console.log('✅ Camera permission granted');

      const videoInputDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = videoInputDevices.filter(device => device.kind === 'videoinput');
      
      console.log('📱 Available cameras:', cameras.length);
      
      if (cameras.length === 0) {
        throw new Error('No camera devices found');
      }

      const backCamera = cameras.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      const selectedDeviceId = backCamera ? backCamera.deviceId : cameras[0].deviceId;

      console.log('📱 Selected camera:', backCamera ? 'Back camera' : 'Default camera');
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
      console.error('📱 Camera start error:', err);
      
      // Provide more specific error messages for mobile users
      let errorMessage = 'Failed to start camera.';
      if (err instanceof Error) {
        if (err.message.includes('Permission denied') || err.message.includes('NotAllowedError')) {
          errorMessage = '📱 Camera permission denied. Please allow camera access and try again.';
        } else if (err.message.includes('NotFoundError') || err.message.includes('No camera')) {
          errorMessage = '📱 No camera found. Please ensure your device has a camera.';
        } else if (err.message.includes('NotSupportedError')) {
          errorMessage = '📱 Camera not supported on this browser. Try using Chrome or Safari.';
        } else if (err.message.includes('NotReadableError')) {
          errorMessage = '📱 Camera is busy or unavailable. Close other camera apps and try again.';
        }
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: errorMessage,
      });
    }
  }, [handleQRScan, captureFrame, processWithOCR, toast]);
  
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
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
  }, [processWithOCR, toast]);

  return {
    videoRef,
    canvasRef,
    isScanning,
    isLoading,
    isFetchingGIA,
    error,
    startScanning,
    stopScanning,
    handleFileUpload,
  };
}
