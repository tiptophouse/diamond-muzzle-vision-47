
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkStatusUpdate: () => void;
}

export function BulkActionsToolbar({ selectedCount, onClearSelection, onBulkDelete, onBulkStatusUpdate }: BulkActionsToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <div className="flex gap-2 ml-auto">
        <Button size="sm" variant="outline" onClick={onBulkStatusUpdate}>
          <Edit className="h-4 w-4 mr-1" />
          Update Status
        </Button>
        <Button size="sm" variant="destructive" onClick={onBulkDelete}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          Clear
        </Button>
      </div>
    </div>
  );
}
