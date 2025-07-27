
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw } from 'lucide-react';
import { useButtonFunctionality } from '@/hooks/useButtonFunctionality';

interface FormActionsProps {
  onReset: () => void;
  isLoading: boolean;
}

export function FormActions({ onReset, isLoading }: FormActionsProps) {
  const { createFunctionalButton } = useButtonFunctionality();

  const handleReset = createFunctionalButton(
    onReset,
    {
      haptic: 'light',
      confirmAction: 'Are you sure you want to reset the form? All entered data will be lost.',
      showToast: { message: 'Form reset successfully', type: 'info' }
    }
  );

  return (
    <div className="flex gap-3 w-full">
      <Button 
        type="button"
        variant="outline" 
        onClick={handleReset}
        disabled={isLoading}
        className="flex-1 h-12 text-base active:scale-95 transition-transform touch-target"
      >
        <RefreshCw className="h-5 w-5 mr-2" />
        Reset
      </Button>
      <Button 
        type="submit"
        disabled={isLoading}
        className="flex-2 h-12 text-base font-semibold active:scale-95 transition-transform bg-primary hover:bg-primary/90 touch-target"
      >
        <Save className="h-5 w-5 mr-2" />
        {isLoading ? "Adding..." : "Add Diamond"}
      </Button>
    </div>
  );
}
