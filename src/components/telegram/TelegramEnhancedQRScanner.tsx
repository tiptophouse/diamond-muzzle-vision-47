import React, { useCallback, useEffect, useState } from 'react';
import { useAdvancedTelegramSDK } from '@/hooks/useAdvancedTelegramSDK';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface TelegramEnhancedQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
  instructions?: string;
  fallbackCamera?: boolean;
}

export function TelegramEnhancedQRScanner({
  isOpen,
  onClose,
  onScan,
  title = 'Scan QR Code',
  instructions = 'Position the QR code within the camera frame',
  fallbackCamera = true
}: TelegramEnhancedQRScannerProps) {
  const { qrScanner, haptics, isInitialized } = useAdvancedTelegramSDK();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  // Handle QR scan result
  const handleScanResult = useCallback((result: string) => {
    console.log('🔍 QR Code scanned:', result);
    
    haptics.notification('success');
    
    setIsScanning(false);
    qrScanner.close();
    onScan(result);
    onClose();
    
    toast.success('QR Code scanned successfully!');
  }, [qrScanner, haptics, onScan, onClose]);

  // Handle scan error
  const handleScanError = useCallback((error: any) => {
    console.error('❌ QR Scan error:', error);
    
    haptics.notification('error');
    setError(error.message || 'Failed to scan QR code');
    setIsScanning(false);
    
    if (fallbackCamera) {
      setShowFallback(true);
    }
    
    toast.error('QR scan failed. Try again or use camera fallback.');
  }, [haptics, fallbackCamera]);

  // Start Telegram native QR scanner
  const startTelegramScanner = useCallback(() => {
    if (!qrScanner.isSupported) {
      console.log('📱 Telegram QR scanner not supported, showing fallback');
      if (fallbackCamera) {
        setShowFallback(true);
      } else {
        toast.error('QR scanner is not supported on this device');
      }
      return;
    }

    try {
      setError(null);
      setIsScanning(true);
      
      console.log('📷 Opening Telegram QR scanner...');
      
      // Open the Telegram native QR scanner
      qrScanner.open(instructions);
      
      haptics.impact('medium');
      
      // Note: Telegram QR scanner events would be handled via the SDK
      // This is a simplified implementation - in reality, you'd need to 
      // listen for QR scan events from the Telegram SDK
      
    } catch (error: any) {
      handleScanError(error);
    }
  }, [qrScanner, instructions, haptics, handleScanError, fallbackCamera]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false);
    qrScanner.close();
    haptics.impact('light');
  }, [qrScanner, haptics]);

  // Handle dialog open/close
  useEffect(() => {
    if (isOpen && isInitialized) {
      startTelegramScanner();
    } else if (!isOpen && isScanning) {
      stopScanning();
    }
  }, [isOpen, isInitialized, startTelegramScanner, stopScanning, isScanning]);

  // Fallback camera scanner (web-based)
  const FallbackCameraScanner = () => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    
    const startCamera = useCallback(async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Use back camera
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        setStream(mediaStream);
        
        // Here you would integrate with a web-based QR scanner library
        // like @zxing/library or qr-scanner
        console.log('📷 Fallback camera started');
        
      } catch (error) {
        console.error('Camera error:', error);
        toast.error('Failed to access camera');
      }
    }, []);

    const stopCamera = useCallback(() => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }, [stream]);

    useEffect(() => {
      if (showFallback) {
        startCamera();
      }
      
      return stopCamera;
    }, [showFallback, startCamera, stopCamera]);

    return (
      <div className="space-y-4">
        <div className="text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Telegram QR scanner not available. Using camera fallback.
          </p>
        </div>
        
        {stream && (
          <div className="relative">
            <video
              autoPlay
              playsInline
              muted
              className="w-full aspect-square object-cover rounded-lg"
              ref={(video) => {
                if (video && stream) {
                  video.srcObject = stream;
                }
              }}
            />
            <div className="absolute inset-0 border-2 border-primary rounded-lg">
              <div className="absolute inset-4 border border-white/50 rounded">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br"></div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFallback(false)}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={() => {
              // Simulate scan result for demo
              handleScanResult('demo-qr-data-12345');
            }}
            className="flex-1"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Simulate Scan
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {showFallback ? (
            <FallbackCameraScanner />
          ) : (
            <>
              {/* Telegram Scanner UI */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <QrCode className="w-24 h-24 mx-auto text-primary" />
                  {isScanning && (
                    <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-lg"></div>
                  )}
                </div>
                
                <div>
                  <p className="font-medium mb-2">{instructions}</p>
                  {qrScanner.isSupported ? (
                    <p className="text-sm text-muted-foreground">
                      Using Telegram's native QR scanner for optimal performance
                    </p>
                  ) : (
                    <p className="text-sm text-yellow-600">
                      Telegram QR scanner not available on this device
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                
                {!qrScanner.isSupported && fallbackCamera && (
                  <Button 
                    onClick={() => setShowFallback(true)}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Use Camera
                  </Button>
                )}
                
                {isScanning && (
                  <Button 
                    variant="destructive" 
                    onClick={stopScanning}
                    className="flex-1"
                  >
                    Stop Scan
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}