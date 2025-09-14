import { Button } from '@/components/ui/button';
import { Grid3X3, Table } from 'lucide-react';

interface InventoryViewToggleProps {
  view: 'cards' | 'table';
  onViewChange: (view: 'cards' | 'table') => void;
}

export function InventoryViewToggle({ view, onViewChange }: InventoryViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant={view === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="h-8 px-3"
      >
        <Grid3X3 className="h-4 w-4 mr-1" />
        כרטיסים
      </Button>
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="h-8 px-3"
      >
        <Table className="h-4 w-4 mr-1" />
        טבלה
      </Button>
    </div>
  );
}