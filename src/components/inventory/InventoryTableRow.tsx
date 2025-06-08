
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "./InventoryTable";
import { useStoreVisibilityToggle } from "@/hooks/useStoreVisibilityToggle";

interface InventoryTableRowProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
}

export function InventoryTableRow({ diamond, onEdit, onDelete }: InventoryTableRowProps) {
  const { toggleStoreVisibility, loading } = useStoreVisibilityToggle();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStoreToggle = async () => {
    const success = await toggleStoreVisibility(diamond.id, diamond.store_visible || false);
    if (success) {
      // Refresh the data or update the local state
      window.location.reload();
    }
  };

  return (
    <TableRow className="hover:bg-slate-50/50 transition-colors duration-150">
      <TableCell className="font-medium text-slate-900">{diamond.stockNumber}</TableCell>
      <TableCell className="text-slate-700">{diamond.shape}</TableCell>
      <TableCell className="text-slate-700">{diamond.carat}</TableCell>
      <TableCell className="text-slate-700">{diamond.color}</TableCell>
      <TableCell className="text-slate-700">{diamond.clarity}</TableCell>
      <TableCell className="text-slate-700">{diamond.cut}</TableCell>
      <TableCell className="font-medium text-slate-900">{formatPrice(diamond.price)}</TableCell>
      <TableCell>
        <Badge className={getStatusColor(diamond.status)}>
          {diamond.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge 
          variant={diamond.store_visible ? "default" : "secondary"}
          className={diamond.store_visible ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}
        >
          {diamond.store_visible ? "Visible in Store" : "Hidden from Store"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStoreToggle}
            disabled={loading}
            className={`transition-all duration-200 ${
              diamond.store_visible 
                ? "border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300" 
                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
            }`}
          >
            {diamond.store_visible ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Show
              </>
            )}
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(diamond)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(diamond.id)}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
