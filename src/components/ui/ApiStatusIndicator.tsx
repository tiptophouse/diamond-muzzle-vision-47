import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';

interface ApiStatusIndicatorProps {
  isConnected: boolean;
  className?: string;
}

export function ApiStatusIndicator({ isConnected, className }: ApiStatusIndicatorProps) {
  if (isConnected) {
    return null; // Don't show anything when connected
  }

  return (
    <Alert className={`border-yellow-200 bg-yellow-50 ${className}`}>
      <WifiOff className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <strong>Offline Mode:</strong> Server connection unavailable. Your changes are being saved locally and will sync when connection is restored.
      </AlertDescription>
    </Alert>
  );
}