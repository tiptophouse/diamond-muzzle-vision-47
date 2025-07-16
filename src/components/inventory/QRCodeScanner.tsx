
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Loader2, Upload } from 'lucide-react';
import { useGiaScanner } from '@/hooks/useGiaScanner';

interface QRCodeScannerProps {
  onScanSuccess: (giaData: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRCodeScanner({ onScanSuccess, onClose, isOpen }: QRCodeScannerProps) {
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
  } = useGiaScanner({ onScanSuccess, isOpen });

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
              Scan Diamond Certificate
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
                <Button 
                  onClick={startScanning} 
                  className="flex-1 touch-target" 
                  disabled={isFetchingGIA}
                  style={{ minHeight: '48px', fontSize: '16px' }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
                <Button 
                  onClick={triggerFileUpload} 
                  variant="outline" 
                  className="flex-1 touch-target" 
                  disabled={isFetchingGIA}
                  style={{ minHeight: '48px', fontSize: '16px' }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </>
            ) : (
              <Button 
                onClick={stopScanning} 
                variant="outline" 
                className="flex-1 touch-target" 
                disabled={isFetchingGIA}
                style={{ minHeight: '48px', fontSize: '16px' }}
              >
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
