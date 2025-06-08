
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "./InventoryTable";

interface InventoryTableRowProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
  onToggleStoreVisibility?: (diamond: Diamond) => void;
}

export function InventoryTableRow({ diamond, onEdit, onDelete, onToggleStoreVisibility }: InventoryTableRowProps) {
  const isStoreVisible = (diamond as any).store_visible || false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <TableCell className="w-16">
        {diamond.imageUrl && (
          <img 
            src={diamond.imageUrl} 
            alt={`Diamond ${diamond.stockNumber}`}
            className="w-10 h-10 rounded object-cover border border-slate-200 dark:border-slate-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        )}
      </TableCell>
      <TableCell className="font-medium text-slate-900 dark:text-slate-100">
        {diamond.stockNumber}
      </TableCell>
      <TableCell className="text-slate-700 dark:text-slate-300 capitalize">
        {diamond.shape}
      </TableCell>
      <TableCell className="text-right font-semibold text-slate-900 dark:text-slate-100">
        {diamond.carat.toFixed(2)}
      </TableCell>
      <TableCell className="text-slate-700 dark:text-slate-300 font-medium">
        {diamond.color}
      </TableCell>
      <TableCell className="text-slate-700 dark:text-slate-300 font-medium">
        {diamond.clarity}
      </TableCell>
      <TableCell className="text-slate-700 dark:text-slate-300">
        {diamond.cut}
      </TableCell>
      <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100">
        {formatPrice(diamond.price)}
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(diamond.status)}>
          {diamond.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Button
          variant={isStoreVisible ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleStoreVisibility?.(diamond)}
          className={isStoreVisible 
            ? "bg-green-600 hover:bg-green-700 text-white" 
            : "text-gray-600 hover:text-green-600 hover:border-green-600"
          }
        >
          {isStoreVisible ? (
            <>
              <Eye className="h-4 w-4 mr-1" />
              Published
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 mr-1" />
              Publish to Store
            </>
          )}
        </Button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(diamond)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(diamond.id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
