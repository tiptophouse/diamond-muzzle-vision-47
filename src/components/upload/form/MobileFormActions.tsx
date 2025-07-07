
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw, Loader2 } from 'lucide-react';

interface MobileFormActionsProps {
  onReset: () => void;
  isLoading: boolean;
}

export function MobileFormActions({ onReset, isLoading }: MobileFormActionsProps) {
  return (
    <div className="space-y-3 pt-6 border-t">
      <Button 
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-diamond-600 hover:bg-diamond-700 text-white font-medium text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Adding Diamond...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Add to Inventory
          </>
        )}
      </Button>
      
      <Button 
        type="button"
        variant="outline" 
        onClick={onReset}
        disabled={isLoading}
        className="w-full h-12 text-base"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset Form
      </Button>
    </div>
  );
}
