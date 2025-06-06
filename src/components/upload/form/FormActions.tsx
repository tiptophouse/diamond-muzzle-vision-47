
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw } from 'lucide-react';

interface FormActionsProps {
  onReset: () => void;
  isLoading: boolean;
}

export function FormActions({ onReset, isLoading }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-6 border-t">
      <Button 
        type="button"
        variant="outline" 
        onClick={onReset}
        disabled={isLoading}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset Form
      </Button>
      <Button 
        type="submit"
        disabled={isLoading}
      >
        <Save className="h-4 w-4 mr-2" />
        {isLoading ? "Adding Diamond..." : "Add to Inventory"}
      </Button>
    </div>
  );
}
