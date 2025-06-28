
import React, { useState } from 'react';
import { Scan, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';

interface GIAScannerButtonProps {
  onScanResult?: (result: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function GIAScannerButton({ 
  onScanResult, 
  className = '',
  variant = 'default',
  size = 'default'
}: GIAScannerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { trackFeatureUsage } = useEnhancedUserTracking();

  const handleScanResult = (result: string) => {
    console.log('📱 GIA SCANNER: Scan result:', result);
    
    // Track GIA scanner usage
    trackFeatureUsage('gia_scanner', { scan_result: result });
    
    if (onScanResult) {
      onScanResult(result);
    }
    setIsOpen(false);
  };

  const handleOpenScanner = () => {
    console.log('📱 GIA SCANNER: Opening scanner');
    trackFeatureUsage('gia_scanner', { action: 'opened' });
    setIsOpen(true);
  };

  const handleManualInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const certificateNumber = formData.get('certificateNumber') as string;
    
    if (certificateNumber && certificateNumber.trim()) {
      console.log('📱 GIA SCANNER: Manual input:', certificateNumber);
      handleScanResult(certificateNumber.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`gap-2 ${className}`}
          onClick={handleOpenScanner}
        >
          <Scan className="h-4 w-4" />
          GIA Scanner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            GIA Certificate Scanner
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Camera scanning temporarily unavailable. Please enter the GIA certificate number manually.
            </p>
            
            <form onSubmit={handleManualInput} className="space-y-3">
              <div>
                <input
                  type="text"
                  name="certificateNumber"
                  placeholder="Enter GIA Certificate Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
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
