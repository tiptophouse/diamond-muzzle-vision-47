import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Loader2, Upload, Zap } from 'lucide-react';
import { useGiaScanner } from '@/hooks/useGiaScanner';
import { getTelegramWebApp } from '@/utils/telegramWebApp';

interface TelegramCertificateScannerProps {
  onScanSuccess: (giaData: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function TelegramCertificateScanner({ onScanSuccess, onClose, isOpen }: TelegramCertificateScannerProps) {
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

  // Initialize Telegram WebApp haptics
  useEffect(() => {
    if (isOpen) {
      const tg = getTelegramWebApp();
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      }
    }
  }, [isOpen]);

  // Haptic feedback on scan start/stop
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      if (isScanning) {
        tg.HapticFeedback.impactOccurred('medium');
      }
    }
  }, [isScanning]);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Camera className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Scan Certificate</h2>
            <p className="text-xs text-muted-foreground">Position certificate in frame</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {/* Scanning Frame Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Scanning Frame */}
            <div className="w-80 h-56 border-2 border-primary rounded-lg relative">
              {/* Corner indicators */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-primary rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-primary rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-primary rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-primary rounded-br-lg" />
              
              {/* Scanning line animation */}
              {isScanning && (
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="absolute w-full h-0.5 bg-primary animate-pulse" 
                       style={{ 
                         animation: 'scan-line 2s ease-in-out infinite',
                         top: '50%',
                         transform: 'translateY(-50%)'
                       }} />
                </div>
              )}
            </div>
            
            {/* Instructions */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-white text-sm font-medium">
                {isScanning ? 'Scanning...' : 'Align certificate within frame'}
              </p>
            </div>
          </div>
        </div>

        {/* Canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Loading Overlay */}
        {(isLoading || isFetchingGIA) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="bg-background rounded-lg p-6 text-center space-y-4 max-w-xs mx-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <div>
                <p className="font-medium text-foreground">
                  {isFetchingGIA ? 'Processing Certificate' : 'Starting Camera'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isFetchingGIA ? 'Extracting diamond details...' : 'Preparing scanner...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-4 right-4">
          <div className="bg-destructive/90 text-destructive-foreground p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="p-4 bg-background/95 backdrop-blur-sm border-t space-y-3">
        {/* Primary Actions */}
        <div className="flex gap-3">
          {!isScanning ? (
            <>
              <Button 
                onClick={startScanning} 
                className="flex-1 h-12" 
                disabled={isFetchingGIA}
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
              <Button 
                onClick={triggerFileUpload} 
                variant="outline" 
                className="flex-1 h-12" 
                disabled={isFetchingGIA}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </>
          ) : (
            <Button 
              onClick={stopScanning} 
              variant="outline" 
              className="flex-1 h-12" 
              disabled={isFetchingGIA}
            >
              Stop Scanning
            </Button>
          )}
        </div>

        {/* AI Enhancement Notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 p-2 rounded-lg">
          <Zap className="h-3 w-3 text-primary" />
          <span>AI-powered OCR will extract all diamond details automatically</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}