
import React, { useState, useCallback } from 'react';
import { useModernTelegramSDK } from '@/hooks/useModernTelegramSDK';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera, X } from 'lucide-react';

interface ModernQRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function ModernQRScanner({ onScan, onClose, isOpen }: ModernQRScannerProps) {
  const { scanQR, isInitialized } = useModernTelegramSDK();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTelegramScan = useCallback(async () => {
    if (!isInitialized) {
      setError('Telegram SDK not initialized');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      
      const result = await scanQR('Scan diamond certificate QR code');
      
      if (result) {
        onScan(result);
        onClose();
      }
    } catch (error) {
      console.error('❌ Telegram QR scan failed:', error);
      setError('QR scan failed');
    } finally {
      setIsScanning(false);
    }
  }, [isInitialized, scanQR, onScan, onClose]);

  const handleBrowserScan = useCallback(async () => {
    try {
      setIsScanning(true);
      setError(null);

      const codeReader = new BrowserMultiFormatReader();
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.play();

      // Create a temporary container for scanning
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.backgroundColor = 'black';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      
      videoElement.style.maxWidth = '100%';
      videoElement.style.maxHeight = '100%';
      
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '✕';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '20px';
      closeButton.style.right = '20px';
      closeButton.style.background = 'rgba(255,255,255,0.8)';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '50%';
      closeButton.style.width = '40px';
      closeButton.style.height = '40px';
      closeButton.style.fontSize = '20px';
      closeButton.style.cursor = 'pointer';
      
      container.appendChild(videoElement);
      container.appendChild(closeButton);
      document.body.appendChild(container);

      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(container);
        setIsScanning(false);
      };

      closeButton.onclick = cleanup;

      // Start decoding
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoElement);
      
      if (result) {
        onScan(result.getText());
        onClose();
      }
      
      cleanup();

    } catch (error) {
      console.error('❌ Browser QR scan failed:', error);
      setError('Camera access failed');
      setIsScanning(false);
    }
  }, [onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Scan QR Code</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            disabled={isScanning}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            {isInitialized && (
              <Button
                onClick={handleTelegramScan}
                disabled={isScanning}
                className="w-full flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                {isScanning ? 'Scanning...' : 'Use Telegram Scanner'}
              </Button>
            )}
            
            <Button
              onClick={handleBrowserScan}
              disabled={isScanning}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              {isScanning ? 'Scanning...' : 'Use Camera'}
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Scan a diamond certificate QR code to auto-fill details
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
