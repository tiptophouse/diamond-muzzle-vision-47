
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw } from 'lucide-react';

interface FormActionsProps {
  onReset: () => void;
  isLoading: boolean;
}

export function FormActions({ onReset, isLoading }: FormActionsProps) {
  return (
    <div className="flex gap-3 w-full">
      <Button 
        type="button"
        variant="outline" 
        onClick={onReset}
        disabled={isLoading}
        className="flex-1 h-12 text-base active:scale-95 transition-transform"
      >
        <RefreshCw className="h-5 w-5 mr-2" />
        Reset
      </Button>
      <Button 
        type="submit"
        disabled={isLoading}
        className="flex-2 h-12 text-base font-semibold active:scale-95 transition-transform bg-primary hover:bg-primary/90"
      >
        <Save className="h-5 w-5 mr-2" />
        {isLoading ? "Adding..." : "Add Diamond"}
      </Button>
    </div>
  );
}
