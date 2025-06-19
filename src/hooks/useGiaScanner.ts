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
      toast({
        title: "Processing with Advanced OCR",
        description: "Extracting ALL diamond data from GIA certificate...",
      });

      const { data, error } = await supabase.functions.invoke('fetch-gia-data', {
        body: { 
          imageData,
          useOCR: true,
          extractAllFields: true // Request comprehensive field extraction
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to process image with OCR');
      }

      if (data) {
        // Enhanced data mapping with all possible GIA fields
        const enhancedData = {
          // Basic diamond data
          stockNumber: data.stockNumber || data.certificateNumber || data.reportNumber,
          certificateNumber: data.certificateNumber || data.reportNumber,
          shape: data.shape || data.cut_shape,
          carat: parseFloat(data.carat || data.weight || data.caratWeight) || 0,
          color: data.color,
          clarity: data.clarity,
          cut: data.cut || data.cutGrade || 'Excellent',
          
          // Detailed measurements
          length: parseFloat(data.length || data.measurements?.length) || undefined,
          width: parseFloat(data.width || data.measurements?.width) || undefined,
          depth: parseFloat(data.depth || data.measurements?.depth) || undefined,
          
          // Additional grades
          polish: data.polish || data.polishGrade,
          symmetry: data.symmetry || data.symmetryGrade,
          fluorescence: data.fluorescence || data.fluorescenceGrade,
          
          // Percentages and ratios
          tablePercentage: parseFloat(data.tablePercentage || data.table) || undefined,
          depthPercentage: parseFloat(data.depthPercentage || data.depthPercent) || undefined,
          ratio: parseFloat(data.ratio || data.lengthToWidthRatio) || undefined,
          
          // Girdle and culet
          gridle: data.gridle || data.girdleThickness,
          culet: data.culet || data.culetSize,
          
          // Lab and certificate info
          lab: data.lab || 'GIA',
          certificateUrl: data.certificateUrl || data.reportUrl,
          
          // Pricing (if available)
          price: parseFloat(data.price) || undefined,
          pricePerCarat: parseFloat(data.pricePerCarat) || undefined,
          
          // Additional fields
          comments: data.comments || data.inscriptions,
          origin: data.origin,
          treatment: data.treatment
        };

        console.log('Enhanced GIA data extracted:', enhancedData);
        onScanSuccess(enhancedData);
        stopScanning();
        
        toast({
          title: "Complete Success!",
          description: "GIA certificate data extracted successfully with all available fields",
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
        title: "Fetching Complete GIA Data",
        description: "Getting comprehensive diamond information from GIA database...",
      });

      const { data, error } = await supabase.functions.invoke('fetch-gia-data', {
        body: { 
          certificateNumber,
          extractAllFields: true // Request all available fields
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch GIA data');
      }

      if (data) {
        // Map comprehensive GIA data
        const completeData = {
          stockNumber: data.stockNumber || certificateNumber,
          certificateNumber: certificateNumber,
          shape: data.shape,
          carat: parseFloat(data.carat) || 0,
          color: data.color,
          clarity: data.clarity,
          cut: data.cut || 'Excellent',
          
          // Enhanced measurements and details
          length: parseFloat(data.length) || undefined,
          width: parseFloat(data.width) || undefined,
          depth: parseFloat(data.depth) || undefined,
          tablePercentage: parseFloat(data.tablePercentage) || undefined,
          depthPercentage: parseFloat(data.depthPercentage) || undefined,
          ratio: parseFloat(data.ratio) || undefined,
          
          polish: data.polish,
          symmetry: data.symmetry,
          fluorescence: data.fluorescence,
          gridle: data.gridle,
          culet: data.culet,
          
          lab: 'GIA',
          price: parseFloat(data.estimatedPrice) || undefined,
          
          // Additional certificate details
          certificateUrl: data.certificateUrl,
          comments: data.comments
        };

        onScanSuccess(completeData);
        stopScanning();
        toast({
          title: "Complete Success!",
          description: "Comprehensive GIA diamond information loaded successfully",
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
