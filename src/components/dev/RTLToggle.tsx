import { Languages } from 'lucide-react';
import { useRTL } from '@/hooks/useRTL';
import { Button } from '@/components/ui/button';

/**
 * Development tool for testing RTL/LTR switching
 * Remove or hide in production
 */
export function RTLToggle() {
  const { isRTL, toggleDirection } = useRTL();
  
  // Only show in development
  const isDev = import.meta.env.DEV;
  
  if (!isDev) return null;
  
  return (
    <Button
      onClick={toggleDirection}
      variant="outline"
      size="sm"
      className="fixed bottom-4 left-4 z-50 shadow-lg"
      title={isRTL ? 'Switch to English' : 'Switch to Hebrew'}
    >
      <Languages className="w-4 h-4 me-2" />
      {isRTL ? 'EN' : 'עב'}
    </Button>
  );
}
