
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Diamond } from "./InventoryTable";
import { useEffect, useRef } from "react";

interface InventoryTableHeaderProps {
  onSort?: (field: keyof Diamond) => void;
  sortField?: keyof Diamond;
  sortDirection?: 'asc' | 'desc';
  selectedIds?: string[];
  allIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function InventoryTableHeader({ 
  onSort, 
  sortField, 
  sortDirection, 
  selectedIds = [], 
  allIds = [], 
  onSelectionChange 
}: InventoryTableHeaderProps) {
  const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < allIds.length;
  const checkboxRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      const input = checkboxRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (input) {
        input.indeterminate = someSelected;
      }
    }
  }, [someSelected]);

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allIds);
    }
  };

  const SortableHeader = ({ field, children, className }: { 
    field: keyof Diamond, 
    children: React.ReactNode,
    className?: string 
  }) => (
    <TableHead className={`font-semibold text-slate-900 bg-slate-50 ${className || ''}`}>
      <Button
        variant="ghost"
        className="h-auto p-0 font-semibold hover:bg-transparent"
        onClick={() => onSort?.(field)}
      >
        <span className="mr-1">{children}</span>
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        )}
      </Button>
    </TableHead>
  );

  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent border-slate-200">
        <TableHead className="font-semibold text-slate-900 bg-slate-50 w-12">
          <Checkbox
            ref={checkboxRef}
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            aria-label="Select all"
          />
        </TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Image</TableHead>
        <SortableHeader field="diamondId">Diamond ID</SortableHeader>
        <SortableHeader field="stockNumber">Stock #</SortableHeader>
        <SortableHeader field="certificateNumber">Cert #</SortableHeader>
        <SortableHeader field="shape">Shape</SortableHeader>
        <SortableHeader field="carat" className="text-right">Carat</SortableHeader>
        <SortableHeader field="color">Color</SortableHeader>
        <SortableHeader field="clarity">Clarity</SortableHeader>
        <SortableHeader field="cut">Cut</SortableHeader>
        <SortableHeader field="price" className="text-right">Price</SortableHeader>
        <SortableHeader field="status">Status</SortableHeader>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
