import { ReactNode } from 'react';
import { useInventoryCheck } from '@/hooks/useInventoryCheck';
import { NoStockPrompt } from './NoStockPrompt';

interface InventoryGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireStock?: boolean;
  onUploadClick?: () => void;
}

export function InventoryGuard({ 
  children, 
  fallback,
  requireStock = true,
  onUploadClick 
}: InventoryGuardProps) {
  const { data: inventory, isLoading } = useInventoryCheck();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">בודק מלאי...</p>
        </div>
      </div>
    );
  }

  if (requireStock && !inventory?.hasStock) {
    return fallback || <NoStockPrompt onUploadClick={onUploadClick} />;
  }

  return <>{children}</>;
}