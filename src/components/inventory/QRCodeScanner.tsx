
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Loader2, Upload } from 'lucide-react';
import { useGiaScanner } from '@/hooks/useGiaScanner';

interface QRCodeScannerProps {
  onScanResult: (result: string) => void;
  onError?: (error: any) => void;
}

export function QRCodeScanner({ onScanResult, onError }: QRCodeScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    videoRef,
    canvasRef,
    isScanning,
    isLoading,
    isFetchingGIA,
    error,
    startScanning,
    stopScanning,
    handleFileUpload,
  } = useGiaScanner({ 
    onScanSuccess: (giaData: any) => {
      // Extract certificate number or relevant info for backward compatibility
      const result = giaData.certificateNumber || JSON.stringify(giaData);
      onScanResult(result);
    }, 
    isOpen: true 
  });

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Scan GIA Certificate
        </CardTitle>
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
          <div className="text-red-600 text-sm text-center">
            {error}
            {onError && onError(new Error(error))}
          </div>
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
  );
}
