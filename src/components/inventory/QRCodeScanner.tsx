
import React, { useState } from 'react';
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
  const [manualInput, setManualInput] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (manualInput.trim()) {
      console.log('Manual certificate input:', manualInput);
      
      toast({
        title: "Certificate Added",
        description: "Processing certificate data...",
      });
      
      onScanSuccess(manualInput.trim());
      setManualInput('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Certificate Input
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Camera scanning temporarily unavailable. Please enter the certificate number manually.
            </p>
            
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter Certificate Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Camera className="mr-2 h-4 w-4" />
                  Add Certificate
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
