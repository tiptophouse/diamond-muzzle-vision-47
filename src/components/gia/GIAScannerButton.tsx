
import React, { useState } from 'react';
import { Scan, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QRCodeScanner } from '@/components/inventory/QRCodeScanner';
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

  const handleScanSuccess = (giaData: any) => {
    console.log('📱 GIA SCANNER: Scan success with extracted data:', giaData);
    
    // Track GIA scanner usage
    trackFeatureUsage('gia_scanner', { scan_result: 'success', extracted_data: giaData });
    
    if (onScanResult) {
      onScanResult(JSON.stringify(giaData));
    }
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpenScanner = () => {
    console.log('📱 GIA SCANNER: Opening scanner');
    trackFeatureUsage('gia_scanner', { action: 'opened' });
    setIsOpen(true);
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        className={`gap-2 ${className}`}
        onClick={handleOpenScanner}
      >
        <Scan className="h-4 w-4" />
        GIA Scanner
      </Button>

      <QRCodeScanner
        onScanSuccess={handleScanSuccess}
        onClose={handleClose}
        isOpen={isOpen}
      />
    </>
  );
}
