
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GIACertificateScannerProps {
  onScanSuccess: (giaData: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function GIACertificateScanner({ onScanSuccess, onClose, isOpen }: GIACertificateScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      setIsScanning(false);
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    await processWithOCR(imageData);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const processWithOCR = async (imageData: string) => {
    try {
      setIsProcessing(true);
      toast({
        title: "Processing Certificate",
        description: "Extracting diamond data from GIA certificate...",
      });

      const { data, error } = await supabase.functions.invoke('fetch-gia-data', {
        body: { 
          imageData,
          useOCR: true 
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to process certificate with OCR');
      }

      if (data) {
        onScanSuccess(data);
        stopCamera();
        toast({
          title: "Success",
          description: "GIA certificate data extracted successfully",
        });
      } else {
        throw new Error('No data extracted from certificate');
      }

    } catch (error) {
      console.error('Error processing with OCR:', error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to extract certificate data",
      });
    } finally {
      setIsProcessing(false);
    }
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
            <Button variant="ghost" size="sm" onClick={() => { stopCamera(); onClose(); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-video rounded-lg bg-gray-100"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                <p className="text-white text-sm text-center">
                  Processing certificate...
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
                <Button onClick={startCamera} className="flex-1" disabled={isProcessing}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="flex-1" 
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </>
            ) : (
              <>
                <Button onClick={captureAndProcess} className="flex-1" disabled={isProcessing}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture & Process
                </Button>
                <Button onClick={stopCamera} variant="outline" disabled={isProcessing}>
                  Stop Camera
                </Button>
              </>
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
            Position the GIA certificate clearly in the frame and capture, or upload an existing image.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
