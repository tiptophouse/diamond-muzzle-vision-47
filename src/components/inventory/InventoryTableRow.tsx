
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Diamond } from "./InventoryTable";
import { Edit, Trash, ImageIcon, Handshake } from "lucide-react";
import { StoreVisibilityToggle } from "./StoreVisibilityToggle";

interface InventoryTableRowProps {
  diamond: Diamond & { store_visible?: boolean };
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
  onStoreToggle?: (stockNumber: string, isVisible: boolean) => void;
  onCreateKeshett?: (diamond: Diamond) => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export function InventoryTableRow({ diamond, onEdit, onDelete, onStoreToggle, onCreateKeshett, isSelected, onSelect }: InventoryTableRowProps) {
  return (
    <TableRow className={`hover:bg-slate-50 dark:hover:bg-slate-800 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
      <TableCell className="w-12">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select diamond ${diamond.stockNumber}`}
        />
      </TableCell>
      <TableCell className="w-16">
        {diamond.imageUrl ? (
          <img 
            src={diamond.imageUrl} 
            alt={`Diamond ${diamond.stockNumber}`}
            className="w-12 h-12 object-cover rounded border border-slate-200 dark:border-slate-600"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-slate-400" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400">
        {diamond.diamondId || 'N/A'}
      </TableCell>
      <TableCell className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
        {diamond.stockNumber}
      </TableCell>
      <TableCell className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">
        {diamond.certificateNumber || 'N/A'}
      </TableCell>
      <TableCell className="font-medium text-slate-900 dark:text-slate-100">{diamond.shape}</TableCell>
      <TableCell className="text-right font-medium text-slate-900 dark:text-slate-100">
        {diamond.carat.toFixed(2)}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
          {diamond.color}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
          {diamond.clarity}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
          {diamond.cut}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100">
        ${diamond.price.toLocaleString()}
      </TableCell>
      <TableCell>
        <Badge 
          className={`${
            diamond.status === "Available" 
              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200" 
              : diamond.status === "Reserved" 
              ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200" 
              : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-200"
          }`}
          variant="outline"
        >
          {diamond.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {onStoreToggle && (
            <StoreVisibilityToggle 
              stockNumber={diamond.stockNumber}
              isVisible={diamond.store_visible || false}
              onToggle={onStoreToggle}
            />
          )}
          {onCreateKeshett && diamond.status === 'Available' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCreateKeshett(diamond)}
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400"
              title="Create Keshett Agreement"
            >
              <Handshake className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(diamond)}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(diamond.id)}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
