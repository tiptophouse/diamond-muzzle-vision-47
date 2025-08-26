
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface InventoryTableHeaderProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function InventoryTableHeader({ sortBy, sortOrder, onSort }: InventoryTableHeaderProps) {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent border-slate-200">
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Image</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Diamond ID</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Stock #</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">
          <Button variant="ghost" size="sm" onClick={() => onSort('shape')} className="h-auto p-0 font-semibold">
            Shape {getSortIcon('shape')}
          </Button>
        </TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50 text-right">
          <Button variant="ghost" size="sm" onClick={() => onSort('carat')} className="h-auto p-0 font-semibold">
            Carat {getSortIcon('carat')}
          </Button>
        </TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">
          <Button variant="ghost" size="sm" onClick={() => onSort('color')} className="h-auto p-0 font-semibold">
            Color {getSortIcon('color')}
          </Button>
        </TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">
          <Button variant="ghost" size="sm" onClick={() => onSort('clarity')} className="h-auto p-0 font-semibold">
            Clarity {getSortIcon('clarity')}
          </Button>
        </TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">
          <Button variant="ghost" size="sm" onClick={() => onSort('cut')} className="h-auto p-0 font-semibold">
            Cut {getSortIcon('cut')}
          </Button>
        </TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50 text-right">
          <Button variant="ghost" size="sm" onClick={() => onSort('price')} className="h-auto p-0 font-semibold">
            Price {getSortIcon('price')}
          </Button>
        </TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Status</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
