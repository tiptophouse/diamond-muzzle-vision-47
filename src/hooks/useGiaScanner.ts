
import { useRef, useState, useEffect, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useToast } from '@/hooks/use-toast';
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

  const analyzeImageWithAI = useCallback(async (imageData: string) => {
    try {
      setIsFetchingGIA(true);
      toast({
        title: "🤖 AI Analysis Starting",
        description: "Using GPT Vision to extract diamond data from certificate...",
      });

      console.log('🤖 GIA SCANNER: Starting AI analysis of certificate image');

      const { data, error } = await supabase.functions.invoke('analyze-gia-certificate', {
        body: { 
          imageData,
          extractAllData: true 
        }
      });

      if (error) {
        console.error('❌ GIA SCANNER: AI analysis failed:', error);
        throw new Error(error.message || 'Failed to analyze certificate with AI');
      }

      if (data && data.success) {
        console.log('✅ GIA SCANNER: AI successfully extracted diamond data:', data.diamondData);
        
        toast({
          title: "✅ Certificate Analyzed Successfully",
          description: `Extracted data for ${data.diamondData.shape} diamond, ${data.diamondData.weight} ct`,
        });

        onScanSuccess(data.diamondData);
        stopScanning();
      } else {
        throw new Error(data?.error || 'No diamond data could be extracted from the certificate');
      }

    } catch (error) {
      console.error('❌ GIA SCANNER: AI analysis error:', error);
      toast({
        variant: "destructive",
        title: "❌ AI Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to extract certificate data",
      });
      setError(error instanceof Error ? error.message : "AI analysis failed");
    } finally {
      setIsFetchingGIA(false);
    }
  }, [onScanSuccess, stopScanning, toast]);
  
  const extractCertificateNumber = useCallback((qrText: string): string | null => {
    try {
      // Try various GIA URL patterns
      if (qrText.includes('gia.edu') || qrText.includes('gia.org')) {
        const urlMatch = qrText.match(/reportno[=\/](\d+)/i);
        if (urlMatch) {
          return urlMatch[1];
        }
      }

      // Try pure number
      const numberMatch = qrText.match(/^\d{10,}$/);
      if (numberMatch) {
        return numberMatch[0];
      }

      // Try JSON format
      try {
        const jsonData = JSON.parse(qrText);
        return jsonData.certificate || jsonData.certificateNumber || jsonData.reportNumber;
      } catch {
        // Continue with other parsing methods
      }

      // Try certificate patterns
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
      console.log('📱 GIA SCANNER: QR code detected:', qrText);
      
      const certificateNumber = extractCertificateNumber(qrText);
      
      if (!certificateNumber) {
        console.log('📱 GIA SCANNER: No certificate number found, trying AI image analysis');
        const imageData = captureFrame();
        if (imageData) {
          await analyzeImageWithAI(imageData);
        } else {
          throw new Error("Could not extract certificate number from QR code and failed to capture image");
        }
        return;
      }

      setIsFetchingGIA(true);
      toast({
        title: "🔍 Fetching GIA Data",
        description: `Looking up certificate ${certificateNumber}...`,
      });

      console.log('📱 GIA SCANNER: Fetching GIA data for certificate:', certificateNumber);

      const { data, error } = await supabase.functions.invoke('fetch-gia-data', {
        body: { certificateNumber }
      });

      if (error || !data) {
        console.log('📱 GIA SCANNER: GIA API failed, falling back to AI analysis');
        const imageData = captureFrame();
        if (imageData) {
          await analyzeImageWithAI(imageData);
        } else {
          throw new Error('Failed to fetch GIA data and could not analyze image');
        }
        return;
      }

      console.log('✅ GIA SCANNER: GIA data fetched successfully:', data);
      
      toast({
        title: "✅ GIA Data Retrieved",
        description: "Diamond information loaded from GIA database",
      });

      onScanSuccess(data);
      stopScanning();

    } catch (error) {
      console.error('❌ GIA SCANNER: QR processing failed:', error);
      setError(error instanceof Error ? error.message : "Failed to process QR code");
      
      // Try AI analysis as fallback
      const imageData = captureFrame();
      if (imageData) {
        await analyzeImageWithAI(imageData);
      }
    } finally {
      setIsFetchingGIA(false);
    }
  }, [extractCertificateNumber, onScanSuccess, stopScanning, toast, captureFrame, analyzeImageWithAI]);
  
  const startScanning = useCallback(async () => {
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
            console.log('📱 GIA SCANNER: QR Code detected:', qrText);
            await handleQRScan(qrText);
          }
        }
      );
    } catch (err) {
      setIsLoading(false);
      setError('Failed to start camera. Please ensure camera permissions are granted.');
      console.error('Camera start error:', err);
    }
  }, [handleQRScan]);
  
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('📁 GIA SCANNER: Processing uploaded file:', file.name);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        await analyzeImageWithAI(imageData);
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
  }, [analyzeImageWithAI, toast]);

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
