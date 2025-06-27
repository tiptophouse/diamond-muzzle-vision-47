
import React, { useRef, useEffect, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (result: string) => void;
  onError?: (error: any) => void;
}

export function QRCodeScanner({ isOpen, onClose, onScanSuccess, onError }: QRCodeScannerProps) {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);

  const handleScan = (result: any) => {
    if (result) {
      const scannedText = result.text || result;
      console.log('QR Code scanned:', scannedText);
      
      toast({
        title: "QR Code Scanned",
        description: "Processing certificate data...",
      });
      
      onScanSuccess(scannedText);
      onClose();
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error);
    toast({
      title: "Scanner Error",
      description: "Failed to access camera. Please check permissions.",
      variant: "destructive",
    });
    
    if (onError) {
      onError(error);
    }
  };

  const startScanning = () => {
    setScanning(true);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan GIA Certificate QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            {scanning && (
              <QrReader
                onResult={handleScan}
                onError={handleError}
                style={{ width: '100%' }}
                constraints={{
                  facingMode: 'environment'
                }}
              />
            )}
          </div>
          
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={scanning ? stopScanning : startScanning}
              variant={scanning ? "destructive" : "default"}
            >
              <Camera className="mr-2 h-4 w-4" />
              {scanning ? 'Stop' : 'Start'} Scanner
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
