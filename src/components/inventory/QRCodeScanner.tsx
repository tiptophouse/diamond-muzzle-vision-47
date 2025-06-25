
import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setScanning(true);
      
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Try to find back camera first, otherwise use first available
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      const selectedDevice = backCamera || videoInputDevices[0];

      if (videoRef.current) {
        codeReaderRef.current.decodeFromVideoDevice(
          selectedDevice.deviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              const scannedText = result.getText();
              console.log('QR Code scanned:', scannedText);
              
              toast({
                title: "QR Code Scanned",
                description: "Processing certificate data...",
              });
              
              onScanSuccess(scannedText);
              onClose();
            }
            if (error && error.name !== 'NotFoundException') {
              console.error('QR Scanner error:', error);
              handleError(error);
            }
          }
        );
      }
    } catch (error) {
      console.error('Failed to start scanning:', error);
      handleError(error);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
  };

  const handleError = (error: any) => {
    toast({
      title: "Scanner Error",
      description: "Failed to access camera. Please check permissions.",
      variant: "destructive",
    });
    
    if (onError) {
      onError(error);
    }
  };

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
            <video
              ref={videoRef}
              className="w-full h-64 object-cover rounded-lg bg-gray-100"
              style={{ display: scanning ? 'block' : 'none' }}
            />
            {!scanning && (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
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
