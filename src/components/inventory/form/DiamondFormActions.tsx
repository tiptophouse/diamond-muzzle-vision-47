
import React from 'react';
import { Button } from '@/components/ui/button';
import { Diamond } from '../InventoryTable';
import { useButtonFunctionality } from '@/hooks/useButtonFunctionality';

interface DiamondFormActionsProps {
  diamond?: Diamond;
  isLoading: boolean;
  onCancel: () => void;
}

export function DiamondFormActions({ diamond, isLoading, onCancel }: DiamondFormActionsProps) {
  const { createFunctionalButton } = useButtonFunctionality();

  const handleCancel = createFunctionalButton(
    onCancel,
    { 
      haptic: 'light',
      showToast: { message: 'Form cancelled', type: 'info' }
    }
  );

  return (
    <div className="flex gap-2 pt-4">
      <Button 
        type="submit" 
        disabled={isLoading}
        className="touch-target"
      >
        {isLoading ? 'Saving...' : diamond ? 'Update Diamond' : 'Add Diamond'}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleCancel}
        disabled={isLoading}
        className="touch-target"
      >
        Cancel
      </Button>
    </div>
  );
}
