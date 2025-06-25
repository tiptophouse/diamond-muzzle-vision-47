
import React, { useState } from 'react';
import { Scan, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScanResult={handleScanResult}
        onError={(error) => {
          console.error('GIA Scanner error:', error);
          trackFeatureUsage('gia_scanner', { action: 'error', error: error.message });
        }}
      />
    </>
  );
}
