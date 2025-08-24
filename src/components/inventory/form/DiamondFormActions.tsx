
import React from 'react';
import { Button } from '@/components/ui/button';
import { Diamond } from '../InventoryTable';

interface DiamondFormActionsProps {
  diamond?: Diamond;
  isLoading: boolean;
  onCancel: () => void;
}

export function DiamondFormActions({ diamond, isLoading, onCancel }: DiamondFormActionsProps) {
  return (
    <div className="flex gap-2 pt-4">
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : diamond ? 'Update Diamond' : 'Add Diamond'}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
        Cancel
      </Button>
    </div>
  );
}
