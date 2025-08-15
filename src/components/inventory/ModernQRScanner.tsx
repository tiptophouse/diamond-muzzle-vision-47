
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Camera, X, Loader2, AlertCircle } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface ModernQRScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
  isScanning?: boolean;
}

export function ModernQRScanner({ onScanSuccess, onClose, isScanning = false }: ModernQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeReader] = useState(() => new BrowserMultiFormatReader());

  useEffect(() => {
    let mounted = true;

    const startScanning = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!videoRef.current) return;

        // Start decoding from video element
        await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (!mounted) return;

          if (result) {
            const scannedText = result.getText();
            console.log('📷 QR Code scanned:', scannedText);
            onScanSuccess(scannedText);
          }

          if (error && error.name !== 'NotFoundException') {
            console.error('QR Scanner error:', error);
            setError('שגיאה בסריקת QR Code');
          }
        });

        setIsLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to start QR scanner:', err);
        setError('לא ניתן להפעיל את המצלמה');
        setIsLoading(false);
      }
    };

    startScanning();

    return () => {
      mounted = false;
      codeReader.reset();
    };
  }, [codeReader, onScanSuccess]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Camera className="w-5 h-5" />
          סריקת QR Code
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 left-4"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-6">
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">מפעיל מצלמה...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  נסה שוב
                </Button>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            style={{ display: isLoading || error ? 'none' : 'block' }}
          />
          
          {!isLoading && !error && (
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
            </div>
          )}
        </div>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          כוון את ה-QR Code לתוך המסגרת
        </p>
      </CardContent>
    </Card>
  );
}
